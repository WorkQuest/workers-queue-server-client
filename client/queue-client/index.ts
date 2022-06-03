import { UnionJobTypes } from "../../server/src/worker-job-types/types";
import Redis from "ioredis/built/Redis";
import { Queue } from "bullmq";
import IORedis from 'ioredis';

export class QueueClient {

  private readonly redisConnection: Redis;

  constructor(
    private readonly connectLink,
  ) {
    this.redisConnection = new IORedis(connectLink);
  }

  public async publisher({ name, payload }: UnionJobTypes): Promise<Queue> {
    const queue = new Queue(name, {
      connection: this.redisConnection,
    });

    await queue.add(`${name} - ${new Date()}`, payload);

    return queue;
  }
}
