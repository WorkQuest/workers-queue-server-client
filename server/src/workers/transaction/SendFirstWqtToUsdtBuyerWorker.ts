import container from "../../ioc";
import { Job, Worker } from "bullmq";
import { DomainHandlerTypes, ThirdPartyTypes } from "../../ioc/types";
import { IHandler } from "../../domain-handlers/types";
import { SendFirstWqtToUsdtBuyerPayload } from "../../worker-job-types";
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
      accountAddress: '',
      accountPrivateKey: '',
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
