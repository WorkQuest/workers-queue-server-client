// @ts-ignore
import { UnionJobTypes } from "@worker-job-types/types";
import { Queue } from "bullmq";
export declare class QueueClient {
    private readonly connectLink;
    private readonly redisConnection;
    constructor(connectLink: any);
    publisher({ name, payload }: UnionJobTypes): Promise<Queue>;
}
