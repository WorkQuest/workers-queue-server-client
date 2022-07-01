import Web3 from "web3";
import { inject } from "inversify";
import { BaseDomainHandler } from "../types";
import { ThirdPartyTypes } from "../../ioc/types";
import {
  SendTransactionResult,
  TransactionResultStatus,
  TransferTokenCommand,
} from "../../domain-commands-results";


export class TransferTokenHandler extends BaseDomainHandler<TransferTokenCommand, SendTransactionResult> {

  protected readonly web3Provider: Web3;

  constructor(
    @inject(ThirdPartyTypes.Web3RpcProvider) web3Provider: Web3,
  ) {
    super();

    this.web3Provider = web3Provider;
  }

  public async Handle(command: TransferTokenCommand): SendTransactionResult {
    try {
      const signedTransaction = await this.web3Provider.eth.accounts.signTransaction({
        gas: command.gasLimit,
        gasPrice: command.gasPrice,
        to: command.to,
        from: command.accountSender.accountAddress,
        value: command.amount,
      }, command.accountSender.accountPrivateKey);

      try {
        const receipt = await this.web3Provider.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        return {
          status: receipt.status
            ? TransactionResultStatus.Success
            : TransactionResultStatus.TransactionError,
          transactionReceipt: receipt,
        }
      } catch (error) {
        return {
          status: TransactionResultStatus.BroadcastError,
          stackError: error.toString(),
        }
      }
    } catch (error) {
      return {
        status: TransactionResultStatus.UnknownError,
        stackError: error.toString(),
      }
    }
  }
}
