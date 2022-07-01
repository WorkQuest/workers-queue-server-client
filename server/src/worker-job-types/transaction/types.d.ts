export interface SendFirstWqtToUsdtBuyerPayload {
    readonly ratio: number;
    readonly amount: string;
    readonly recipientAddress: string;
    readonly txHashSwapInitialized: string;
}
export interface ResolveDisputeByAdminPayload {
    questId: string;
    disputeId: string;
    decision: 'Rework' | 'AcceptWork' | 'RejectWork';
}
export declare type SendFirstWqtToUsdtBuyerJob = {
    name: "SendFirstWqtToUsdtBuyer";
    payload: SendFirstWqtToUsdtBuyerPayload;
};
export declare type ResolveDisputeByAdminJob = {
    name: 'ResolveDisputeByAdmin';
    payload: ResolveDisputeByAdminPayload;
};
