import { StatusKYC, User, UserRole, UserStatus } from "@workquest/database-models/lib/models";
import { BaseDomainHandler } from "../types";
import { fn, literal, Op } from "sequelize";
import { injectable } from "inversify";
import {
  WriteUserStatisticCommand,
  WriteUserStatisticResult,
} from "../../domain-commands-results";

@injectable()
export class WriteUserStatisticHandler extends BaseDomainHandler<WriteUserStatisticCommand, WriteUserStatisticResult> {
  private async userGroupCountBuilder(...group): Promise<{ [key: string]: number }> {
    const count: any = await User.unscoped().count({ group });
    const countObject = {};

    count.forEach((count) => {
      const [mainKey, countKey] = Object.keys(count);

      countObject[count[mainKey]] = parseInt(count[countKey]);
    });

    return countObject;
  }

  public async Handle() {
    // const [todayUserStatistics] = await UsersPlatformStatistic.findOrBuild({
    //   where: { date: new Date() }
    // });

    const roles = await this.userGroupCountBuilder('role');
    const statuses = await this.userGroupCountBuilder('status');
    const socialNetworks = await this.userGroupCountBuilder(
      fn(`jsonb_object_keys`, literal(`(settings ->> 'social')::jsonb`))
    );
    const kycPassed = await this.userGroupCountBuilder('statusKYC');
    const smsPassed = await this.userGroupCountBuilder(
      fn('CAST', literal('"phone" IS NOT NULL as bool'))
    );

    // for (const statusesKey in statuses) {
    //   if (parseInt(statusesKey) === UserStatus.Confirmed) {
    //     todayUserStatistics.finished = statuses[statusesKey];
    //   } else {
    //     todayUserStatistics.unfinished += statuses[statusesKey];
    //   }
    // }
    //
    // for (const role in roles) {
    //   if (role === UserRole.Worker) {
    //     todayUserStatistics.workers = roles[role];
    //   } else if (role === UserRole.Employer) {
    //     todayUserStatistics.employers = roles[role];
    //   }
    // }
    //
    // for (const socialNetwork in socialNetworks) {
    //   todayUserStatistics[socialNetwork] = socialNetworks[socialNetwork];
    // }
    //
    // for (const status in kycPassed) {
    //   if (parseInt(status) === StatusKYC.Confirmed) {
    //     todayUserStatistics.kycPassed = kycPassed[status];
    //   } else {
    //     todayUserStatistics.kycNotPassed = kycPassed[status];
    //   }
    // }
    //
    // for (const confirmed in smsPassed) {
    //   if (confirmed === 'true') {
    //     todayUserStatistics.smsPassed = smsPassed[confirmed];
    //   } else {
    //     todayUserStatistics.smsNotPassed = smsPassed[confirmed];
    //   }
    // }
    //
    // todayUserStatistics.registered = await User.unscoped().count({
    //   where: {
    //     createdAt: {
    //       [Op.between]: [
    //         new Date().setHours(0, 0, 0, 0),
    //         new Date().setHours(23, 59, 59, 999)
    //       ]
    //     }
    //   },
    // });
    //
    // todayUserStatistics.use2FA = await User.unscoped().count({
    //   where: { 'settings.security.TOTP.active': true }
    // });
    //
    // console.log(todayUserStatistics)
    // TODO данные из сессий
  }
}
