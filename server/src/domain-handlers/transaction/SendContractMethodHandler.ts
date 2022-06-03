import Web3 from "web3";
import { inject } from "inversify";
import { BaseDomainHandler } from "../types";
import { ThirdPartyTypes } from "../../ioc/types";
import {
  TransactionResultStatus,
  SendTransactionResult,
  SendContractMethodCommand,
} from "../../domain-commands-results";

export class SendContractMethodHandler extends BaseDomainHandler<SendContractMethodCommand, SendTransactionResult> {

  protected readonly web3Provider: Web3;

  constructor(
    @inject(ThirdPartyTypes.Web3RpcProvider) web3Provider: Web3,
  ) {
    super();

    this.web3Provider = web3Provider;
  }

  public async Handle(command: SendContractMethodCommand): SendTransactionResult {
    try {
      const instanceMethod = await command.contract.methods[command.method].call(...command.args)

      const gasLimit = await command.contract.methods[command.method].estimateGas({
        gasPrice: command.gasPrice,
        from: command.accountSender.accountAddress,
      });

      const signedTransaction = await this.web3Provider.eth.accounts.signTransaction({
        value: 0,
        data: instanceMethod.encodeABI(),
        gas: gasLimit,
        gasPrice: command.gasPrice,
        to: command.contractAddress,
        from: command.accountSender.accountAddress,
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
