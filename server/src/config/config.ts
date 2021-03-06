import { config } from 'dotenv';

config();
export default {
  dbLink: process.env.DB_LINK,
  redisLink: process.env.REDIS_LINK,
  workQuestRpcProvider: process.env.WORK_QUEST_RPC_PROVIDER,
  disputeSenderAccount: {
    address: process.env.DISPUTE_SENDER_ACCOUNT_ADDRESS,
    privateKey: process.env.DISPUTE_SENDER_ACCOUNT_PRIVATE_KEY
  },
  sendFirstWqtSenderAccount: {
    address: process.env.SEND_FIRST_WQT_SENDER_ACCOUNT_ADDRESS,
    privateKey: process.env.SEND_FIRST_WQT_SENDER_ACCOUNT_PRIVATE_KEY
  },
}
