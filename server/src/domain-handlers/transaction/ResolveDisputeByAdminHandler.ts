import Web3 from "web3";
import container from "../../ioc";
import { inject } from "inversify";
import { BaseCompositeHandler } from "../types";
import { Sequelize } from "sequelize-typescript";
import { DomainHandlerTypes, ThirdPartyTypes } from "../../ioc/types";
import { SendContractMethodHandler } from "./SendContractMethodHandler";
import { Networks, Store, WorkQuestNetworkContracts } from "@workquest/contract-data-pools";
import {
  Quest,
  Transaction,
  TransactionStatus,
  QuestDisputeDecisionData,
} from "@workquest/database-models/lib/models";
import {
  TransactionResultStatus,
  ResolveDisputeByAdminCommand,
  ResolveDisputeByAdminResult,
} from "../../domain-commands-results";

export class ResolveDisputeByAdminHandler extends BaseCompositeHandler<ResolveDisputeByAdminCommand, ResolveDisputeByAdminResult> {

  protected readonly web3Provider: Web3;

  protected readonly dbContext: Sequelize;

  private static getMethod(decision: 'Rework' | 'AcceptWork' | 'RejectWork') {
    if (decision === 'Rework') {
      return 'arbitrationRework';
    } else if (decision === 'AcceptWork') {
      return 'arbitrationAcceptWork';
    } else if (decision === 'RejectWork') {
      return 'arbitrationRejectWork';
    }
  }

  constructor(
    @inject(ThirdPartyTypes.Web3RpcProvider) web3Provider: Web3,
    @inject(ThirdPartyTypes.DatabaseProvider) dbContext: Sequelize,
  ) {
    super(dbContext);

    this.web3Provider = web3Provider;
  }

  public async Handle(command: ResolveDisputeByAdminCommand): ResolveDisputeByAdminResult {
    const sendContractHandler = container.get<SendContractMethodHandler>(DomainHandlerTypes.SendContractMethod);

    const gasPrice = await this.web3Provider.eth.getGasPrice();

    const questDisputeDecision = await QuestDisputeDecisionData.findOne({
      where: { disputeId: command.disputeId },
    });

    const quest = await Quest.findByPk(command.questId);

    if (!questDisputeDecision) {
      return;
    }
    if (questDisputeDecision.status !== TransactionStatus.Pending) {
      return;
    }

    const contractData = Store[Networks.WorkQuest][WorkQuestNetworkContracts.WorkQuest];
    const contract = new this.web3Provider.eth.Contract(contractData.getAbi(), quest.contractAddress);

    await questDisputeDecision.update({
      gasPriceAtMoment: gasPrice,
      status: TransactionStatus.InProcess,
    });

    this.dbContext.transaction(async (tx) => {
      sendContractHandler.setOptions({ tx });
      const sendResult = await sendContractHandler.Handle({
        contract,
        args: [],
        method: ResolveDisputeByAdminHandler.getMethod(command.decision),
        gasPrice,
        contractAddress: quest.contractAddress,
        accountSender: command.accountSender,
      });

      if (sendResult.status == TransactionResultStatus.UnknownError) {
        await questDisputeDecision.update({
          error: sendResult.stackError,
          status: TransactionStatus.UnknownError,
        }, { transaction: tx });
      }
      if (sendResult.status == TransactionResultStatus.BroadcastError) {
        await questDisputeDecision.update({
          error: sendResult.stackError,
          status: TransactionStatus.BroadcastError,
        }, { transaction: tx });
      }
      if (
        sendResult.status == TransactionResultStatus.TransactionError ||
        sendResult.status == TransactionResultStatus.Success
      ) {
        const transaction = await Transaction.create({
          hash: sendResult.transactionReceipt.transactionHash.toLowerCase(),
          to: command.accountSender.accountAddress.toLowerCase(),
          from: quest.contractAddress.toLowerCase(),
          status: sendResult.transactionReceipt.status ? 0 : 1,
          gasUsed: sendResult.transactionReceipt.gasUsed,
          amount: 0,
          blockNumber: sendResult.transactionReceipt.blockNumber,
          // network: ,
        }, { transaction: tx });

        const transmissionStatus = sendResult.status === TransactionResultStatus.Success
          ? TransactionStatus.Success
          : TransactionStatus.TransactionError

        await questDisputeDecision.update({
          status: transmissionStatus,
          error: sendResult?.stackError,
          transactionHashDisputeResolution: transaction.hash,
        });
      }
    }).catch(error => {
      questDisputeDecision.update({
        error: error.toString(),
        status: TransactionStatus.UnknownError,
      }).catch(console.error);
    })
  }
}
