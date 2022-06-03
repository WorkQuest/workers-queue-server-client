import Web3 from "web3";
import IORedis from "ioredis";
import config from "../config/config";
import Redis from "ioredis/built/Redis";
import { Sequelize } from "sequelize-typescript";
import { AsyncContainerModule, Container } from "inversify";
import { ThirdPartyTypes, DomainHandlerTypes } from "./types";
import { initDatabase } from "@workquest/database-models/lib/models";
import { BaseCompositeHandler, BaseDomainHandler } from "../domain-handlers/types";
import { SendContractMethodHandler } from "../domain-handlers/transaction/SendContractMethodHandler";
import { ResolveDisputeByAdminHandler } from "../domain-handlers/transaction/ResolveDisputeByAdminHandler";
import { SendFirstWqtToUsdtBuyerHandler, TransferTokenHandler, WriteUserStatisticHandler } from "../domain-handlers";

const thirdPartyDependencies = new AsyncContainerModule(async bind => {
  const web3 = new Web3(new Web3.providers.HttpProvider(config.workQuestRpcProvider));
  const db = await initDatabase(config.dbLink);
  const redis = new IORedis(config.redisLink);

  bind<Web3>(ThirdPartyTypes.Web3RpcProvider).toConstantValue(web3);
  bind<Sequelize>(ThirdPartyTypes.DatabaseProvider).toConstantValue(db);
  bind<Redis>(ThirdPartyTypes.RedisProvider).toConstantValue(redis);
});

const domainHandlerDependencies = new AsyncContainerModule(async bind => {
  bind<BaseCompositeHandler<any, any>>(DomainHandlerTypes.SendFirstWqtToUsdtBuyer).to(SendFirstWqtToUsdtBuyerHandler);
  bind<BaseCompositeHandler<any, any>>(DomainHandlerTypes.ResolveDisputeByAdmin).to(ResolveDisputeByAdminHandler);

  bind<BaseDomainHandler<any, any>>(DomainHandlerTypes.TransferToken).to(TransferTokenHandler);
  bind<BaseDomainHandler<any, any>>(DomainHandlerTypes.SendContractMethod).to(SendContractMethodHandler);
  bind<BaseDomainHandler<any, any>>(DomainHandlerTypes.WriteUserStatistic).to(WriteUserStatisticHandler);
});

const container = new Container();

container.load(
  thirdPartyDependencies,
  domainHandlerDependencies,
)

export default container;
