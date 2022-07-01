import { WorkerOptions } from "bullmq";
import { Processor } from "bullmq/dist/esm/interfaces";

export type WorkerInitOptions = {
  name: string;
  job: Processor,
  options: WorkerOptions
}
