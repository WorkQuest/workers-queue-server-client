import { Contract } from "web3-eth-contract";

/** Commands */

export enum DisputeDecision {
  Rework = 'Rework',
  AcceptWork = 'AcceptWork',
  RejectWork = 'RejectWork',
}

export interface SenderAccount {
  readonly accountAddress: string;
  readonly accountPrivateKey: string;
}

export interface SendFirstWqtToUsdtBuyerCommand {
  readonly ratio: number;
  readonly amount: string;
  readonly recipientAddress: string;
  readonly txHashSwapInitialized: string;
  readonly accountSender: SenderAccount;
}

export interface TransferTokenCommand {
  readonly to: string;
  readonly amount: string;
  readonly gasPrice: string;
  readonly gasLimit: number;
  readonly accountSender: SenderAccount;
}

export interface SendContractMethodCommand {
  readonly contract: Contract;
  readonly args: any[];
  readonly method: string;
  readonly gasPrice: string;
  readonly contractAddress: string;
  readonly accountSender: SenderAccount;
}

export interface ResolveDisputeByAdminCommand {
  readonly questId: string;
  readonly disputeId: string;
  readonly decision: 'Rework' | 'AcceptWork' | 'RejectWork';
  readonly accountSender: SenderAccount;
}

/** Results */

export enum TransactionResultStatus {
  UnknownError = -3,
  BroadcastError = -2,
  TransactionError = -1,

  Success = 0,
}

export type SendTransactionResult = Promise<{
  status: TransactionResultStatus,
  stackError?: string;
  transactionReceipt?: any;
}>

export type SendFirstWqtToUsdtBuyerResult = Promise<void>;

export type ResolveDisputeByAdminResult = Promise<void>;
