import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { UpdatePointSettingDto } from './dto/point-setting.dto';

@Injectable()
export class PointSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    params: {
      data: UpdatePointSettingDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { data } = params;

    return this.prisma.pointSetting.upsert({
      where: {
        shopId: tokenPayload.shopId,
      },
      create: {
        value: data.value,
        active: data.active,
        point: data.point,
        shopId: tokenPayload.shopId,
        updatedBy: tokenPayload.accountId,
      },
      update: {
        value: data.value,
        active: data.active,
        point: data.point,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findUniq(tokenPayload: TokenPayload) {
    return this.prisma.pointSetting.findUniqueOrThrow({
      where: {
        shopId: tokenPayload.shopId,
      },
    });
  }
}
