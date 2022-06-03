import workersInitOptions from "./src/workers";
import container from "./src/ioc";
import { ThirdPartyTypes } from "./src/ioc/types";
import { Worker } from "bullmq";

async function init() {
  const isRedisBounded = container.isBound(ThirdPartyTypes.RedisProvider);

  if (!isRedisBounded) {
    return setTimeout(() => init(), 1000);
  }

  const redisProvider = container.get(ThirdPartyTypes.RedisProvider);

  for (const { name, job, options } of workersInitOptions) {
    options.connection = redisProvider;

    const worker = new Worker(name, job, options);

    if (!worker.isRunning()) {
      worker.run();
    }
  }
}

init();
