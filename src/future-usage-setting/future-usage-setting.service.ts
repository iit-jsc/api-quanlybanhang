import { Injectable } from "@nestjs/common";
import { UpdateFutureUsageSettingDto } from "./dto/update-future-usage-setting.dto";
import { TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class FutureUsageSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async findUniq(where: Prisma.FutureUsageSettingWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.futureUsageSetting.findUnique({
      where,
    });
  }

  async update(params: { data: UpdateFutureUsageSettingDto }, tokenPayload: TokenPayload) {
    const { data } = params;
    const result = await this.prisma.futureUsageSetting.upsert({
      where: {
        shopId_futureCode: {
          futureCode: data.futureCode,
          shopId: tokenPayload.shopId,
        },
      },
      create: {
        futureCode: data.futureCode,
        shopId: tokenPayload.shopId,
        isUsed: data.isUsed,
        updatedBy: tokenPayload.accountId,
      },
      update: {
        isUsed: data.isUsed,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(
      [result.futureCode],
      "FutureUsageSetting",
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload,
    );

    return result;
  }
}
