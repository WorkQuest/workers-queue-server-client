export interface SendFirstWqtToUsdtBuyerPayload {
  readonly ratio: number;
  /** Like decimal fraction (0.1 (as 10%) and etc) ) */
  readonly amount: string;
  /** Decimal only in  wei                           */
  readonly recipientAddress: string;
  /** To whom to send tokens                         */
  readonly txHashSwapInitialized: string;     /** Transaction hash from USDT bridge              */
}

export type SendFirstWqtToUsdtBuyerJob = {
  name: "SendFirstWqtToUsdtBuyer",
  payload: SendFirstWqtToUsdtBuyerPayload,
}
