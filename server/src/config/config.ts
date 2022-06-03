import { config } from 'dotenv';

config();
export default {
  dbLink: process.env.DB_LINK,
  redisLink: process.env.REDIS_LINK,
  workQuestRpcProvider: process.env.WORK_QUEST_RPC_PROVIDER,
}
