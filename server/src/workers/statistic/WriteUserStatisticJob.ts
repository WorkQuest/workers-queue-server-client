import { WriteUserStatisticCommand, WriteUserStatisticResult } from "../../domain-commands-results";
import { WriteUserStatisticPayload } from "../../worker-job-types";
import { IHandler } from "../../domain-handlers/types";
import { DomainHandlerTypes } from "../../ioc/types";
import { Job } from "bullmq";
import container from "../../ioc";

async function writeUserStatisticJob(job: Job<WriteUserStatisticPayload>) {
  const writeUserStatistic = container.get<IHandler<WriteUserStatisticCommand, WriteUserStatisticResult>>(DomainHandlerTypes.WriteUserStatistic);

  await writeUserStatistic.Handle({});
}

export default {
  name: 'WriteUserStatistic',
  job: writeUserStatisticJob,
  options: {
    concurrency: 1,
  }
}
