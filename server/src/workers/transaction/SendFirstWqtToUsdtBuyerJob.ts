import { SendFirstWqtToUsdtBuyerPayload } from "../../worker-job-types";
import { IHandler } from "../../domain-handlers/types";
import { DomainHandlerTypes } from "../../ioc/types";
import config from "../../config/config";
import container from "../../ioc";
import { Job, WorkerOptions } from "bullmq";
import {
  SendFirstWqtToUsdtBuyerResult,
  SendFirstWqtToUsdtBuyerCommand,
} from "../../domain-commands-results"

async function sendFirstWqtToUsdtBuyerJob(job: Job<SendFirstWqtToUsdtBuyerPayload>) {
  const sendFirstWqtToUsdtBuyer = container.get<IHandler<SendFirstWqtToUsdtBuyerCommand, SendFirstWqtToUsdtBuyerResult>>(DomainHandlerTypes.SendFirstWqtToUsdtBuyer);

  await sendFirstWqtToUsdtBuyer.Handle({
    ratio: job.data.ratio,
    amount: job.data.amount,
    recipientAddress: job.data.recipientAddress,
    txHashSwapInitialized: job.data.txHashSwapInitialized,
    accountSender: {
      accountAddress: config.sendFirstWqtSenderAccount.address,
      accountPrivateKey: config.sendFirstWqtSenderAccount.privateKey,
    }
  });
}

export default {
  name: 'SendFirstWqtToUsdtBuyer',
  job: sendFirstWqtToUsdtBuyerJob,
  options: {
    concurrency: 1,
  }
}
