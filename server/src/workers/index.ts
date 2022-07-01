import { WorkerInitOptions } from "./types";

import transaction from "./transaction";
import statistic from "./statistic";

export default [
  ...transaction,
  ...statistic
] as WorkerInitOptions[];
