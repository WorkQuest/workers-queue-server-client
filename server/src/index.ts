const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { createBullBoard } = require('@bull-board/api');
const { HapiAdapter } = require('@bull-board/hapi');
import { ThirdPartyTypes } from "./ioc/types";
import workersInitOptions from "./workers";
import config from "./config/config";
import * as Hapi from '@hapi/hapi';
import { Queue } from "bullmq";
import container from "./ioc";

async function initAdapters() {
  const isRedisBounded = container.isBound(ThirdPartyTypes.RedisProvider);

  if (!isRedisBounded) {
    return setTimeout(() => init(), 1000);
  }

  const redisProvider = container.get(ThirdPartyTypes.RedisProvider);

  const adapters = [];

  for (const { name } of workersInitOptions) {
    const queue = new Queue(name, { connection: redisProvider });
    const adapter = new BullMQAdapter(queue);

    adapters.push(adapter);
  }

  return adapters;
}

async function init() {
  const server = await new Hapi.Server({
    port: config.server.port,
    host: config.server.host,
  });

  const serverAdapter = new HapiAdapter();
  const adapters = await initAdapters();

  createBullBoard({ queues: adapters, serverAdapter });

  serverAdapter.setBasePath('/ui');
  await server.register(serverAdapter.registerPlugin(), {
    routes: { prefix: '/ui' }
  });

  try {
    await server.start();
    console.log('Server started on port:', config.server.port);
  } catch (err) {
    console.error(err);
  }
}

try {
  init();
} catch (err) {
  console.error(err)
}