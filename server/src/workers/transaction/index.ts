import { WorkerInitOptions } from "../types";

import SendFirstWqtToUsdtBuyerJob from "./SendFirstWqtToUsdtBuyerJob";
import ResolveDisputeByAdminJob from "./ResolveDisputeByAdminJob";

export default [
  SendFirstWqtToUsdtBuyerJob,
  ResolveDisputeByAdminJob
] as WorkerInitOptions[];
