import { Injectable } from "@nestjs/common";
import { UpdateFutureUsageSettingDto } from "./dto/update-future-usage-setting.dto";
import { TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class FutureUsageSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniq(where: Prisma.FutureUsageSettingWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.futureUsageSetting.findUnique({
      where,
    });
  }

  async update(params: { data: UpdateFutureUsageSettingDto }, tokenPayload: TokenPayload) {
    const { data } = params;
    return this.prisma.futureUsageSetting.upsert({
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
  }
}
