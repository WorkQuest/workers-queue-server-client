import { Queue } from "bullmq";
export declare class QueueClient {
    private readonly connectLink;
    private readonly redisConnection;
    constructor(connectLink: any);
    publisher({ name, payload }: any): Promise<Queue>;
}
