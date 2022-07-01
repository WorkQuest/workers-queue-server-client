import { ResolveDisputeByAdminCommand, ResolveDisputeByAdminResult } from "../../domain-commands-results";
import { ResolveDisputeByAdminPayload } from "../../worker-job-types";
import { IHandler } from "../../domain-handlers/types";
import { DomainHandlerTypes } from "../../ioc/types";
import config from "../../config/config";
import container from "../../ioc";
import { Job } from "bullmq";

async function resolveDisputeByAdminJob(job: Job<ResolveDisputeByAdminPayload>) {
  const resolveDisputeByAdmin = container.get<IHandler<ResolveDisputeByAdminCommand, ResolveDisputeByAdminResult>>(DomainHandlerTypes.ResolveDisputeByAdmin);

  await resolveDisputeByAdmin.Handle({
    questId: job.data.questId,
    disputeId: job.data.disputeId,
    decision: job.data.decision,
    accountSender: {
      accountAddress: config.disputeSenderAccount.address,
      accountPrivateKey: config.disputeSenderAccount.privateKey
    }
  });
}

export default {
  name: 'ResolveDisputeByAdmin',
  job: resolveDisputeByAdminJob,
  options: {
    concurrency: 1
  }
}
