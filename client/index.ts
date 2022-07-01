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

  public async publisher({ name, payload }: any): Promise<Queue> {
    const queue = new Queue(name, {
      connection: this.redisConnection,
    });

    const settings = { };

    if (name === 'ResolveDisputeByAdmin') {
      settings['dalay'] = 4000;
    }

    await queue.add(`${ name } - ${ new Date() }`, payload, settings);

    return queue;
  }
}
