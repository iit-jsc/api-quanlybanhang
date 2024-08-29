import { Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";
import { UpdateFeatureUsageSettingDto } from "./dto/update-future-usage-setting.dto";

@Injectable()
export class FeatureUsageSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async findUniq(where: Prisma.FeatureUsageSettingWhereUniqueInput) {
    return this.prisma.featureUsageSetting.findUnique({
      where,
    });
  }

  async update(params: { data: UpdateFeatureUsageSettingDto }, tokenPayload: TokenPayload) {
    const { data } = params;
    const result = await this.prisma.featureUsageSetting.upsert({
      where: {
        shopId_featureCode: {
          featureCode: data.featureCode,
          shopId: tokenPayload.shopId,
        },
      },
      create: {
        featureCode: data.featureCode,
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
      [result.featureCode],
      "FeatureUsageSetting",
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload,
    );

    return result;
  }
}
