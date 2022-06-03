import { ResolveDisputeByAdminJob, SendFirstWqtToUsdtBuyerJob } from "./transaction/types";
import { WriteUserStatisticJob } from "./statistic/types";

export type UnionJobTypes =
  | SendFirstWqtToUsdtBuyerJob
  | WriteUserStatisticJob
  | ResolveDisputeByAdminJob
