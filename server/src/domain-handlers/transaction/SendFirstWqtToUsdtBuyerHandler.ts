import Web3 from "web3";
import container from "../../ioc";
import BigNumber from "bignumber.js";
import { inject, injectable } from "inversify";
import { BaseCompositeHandler } from "../types";
import { Sequelize } from "sequelize-typescript";
import { TransferTokenHandler } from "./TransferTokenHandler";
import { ThirdPartyTypes, DomainHandlerTypes } from "../../ioc/types";
import {
  Transaction,
  TransactionStatus,
  BlockchainNetworks,
  FirstWqtTransmissionData,
} from "@workquest/database-models/lib/models";
import {
  TransactionResultStatus,
  SendFirstWqtToUsdtBuyerResult,
  SendFirstWqtToUsdtBuyerCommand,
} from "../../domain-commands-results";

@injectable()
export class SendFirstWqtToUsdtBuyerHandler extends BaseCompositeHandler<SendFirstWqtToUsdtBuyerCommand, SendFirstWqtToUsdtBuyerResult> {

  protected readonly web3Provider: Web3;

  protected readonly dbContext: Sequelize;

  constructor(
    @inject(ThirdPartyTypes.Web3RpcProvider) web3Provider: Web3,
    @inject(ThirdPartyTypes.DatabaseProvider) dbContext: Sequelize,
  ) {
    super(dbContext);

    this.dbContext = dbContext;
    this.web3Provider = web3Provider;
  }

  public async Handle(command: SendFirstWqtToUsdtBuyerCommand): SendFirstWqtToUsdtBuyerResult {
    const transferHandler = container.get<TransferTokenHandler>(DomainHandlerTypes.TransferToken);

    const gasLimit = 21000;
    const gasPrice = await this.web3Provider.eth.getGasPrice();

    const transmissionData = await FirstWqtTransmissionData.findOne({
      where: { txHashSwapInitialized: command.txHashSwapInitialized }
    });

    if (!transmissionData) {
      return;
    }
    if (transmissionData.status !== TransactionStatus.Pending) {
      return;
    }

    await transmissionData.update({
      gasPriceAtMoment: gasPrice,
      status: TransactionStatus.InProcess,
    });

    const amountValueToUser = new BigNumber(command.amount);

    const platformCommissionWithTxFee = new BigNumber(
      new BigNumber(gasPrice).multipliedBy(gasLimit)
    )
      .plus(
        amountValueToUser.multipliedBy(command.ratio)
      )

    const amountValueToUserMinusPlatformFee = amountValueToUser
      .minus(platformCommissionWithTxFee)
      .toFixed(0)

    this.dbContext.transaction(async (tx) => {
      transferHandler.setOptions({ tx });

      const transferResult = await transferHandler.Handle({
        gasLimit: 21000,
        gasPrice: gasPrice,
        to: command.recipientAddress,
        amount: amountValueToUserMinusPlatformFee,
        accountSender: command.accountSender,
      });

      if (transferResult.status == TransactionResultStatus.UnknownError) {
        await transmissionData.update({
          error: transferResult.stackError,
          status: TransactionStatus.UnknownError,
        }, { transaction: tx });
      }
      if (transferResult.status == TransactionResultStatus.BroadcastError) {
        await transmissionData.update({
          error: transferResult.stackError,
          status: TransactionStatus.BroadcastError,
        }, { transaction: tx });
      }
      if (
        transferResult.status == TransactionResultStatus.Success ||
        transferResult.status == TransactionResultStatus.TransactionError
      ) {
        const transaction = await Transaction.create({
          hash: transferResult.transactionReceipt.transactionHash.toLowerCase(),
          to: command.recipientAddress.toLowerCase(),
          from: command.accountSender.accountAddress.toLowerCase(),
          status: transferResult.transactionReceipt.status ? 0 : 1,
          gasUsed: transferResult.transactionReceipt.gasUsed,
          amount: amountValueToUserMinusPlatformFee,
          blockNumber: transferResult.transactionReceipt.blockNumber,
          network: BlockchainNetworks.workQuestDevNetwork,
        }, { transaction: tx });

        const transmissionStatus = transferResult.status === TransactionResultStatus.Success
          ? TransactionStatus.Success
          : TransactionStatus.TransactionError

        await transmissionData.update({
          status: transmissionStatus,
          error: transferResult?.stackError,
          transactionHashTransmissionWqt: transaction.hash,
        });
      }
    })
      .catch(error => {
        transmissionData.update({
          error: error.toString(),
          status: TransactionStatus.UnknownError,
        }).catch(console.error);
      })
  }
}
