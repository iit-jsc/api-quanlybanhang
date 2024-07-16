import { Prisma, PrismaClient } from "@prisma/client";
import { HttpStatus, Injectable } from "@nestjs/common";
import { POINT_TYPE } from "enums/common.enum";
import { TokenPayload, TokenCustomerPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CustomHttpException } from "utils/ApiErrors";

@Injectable()
export class PointAccumulationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPointByCustomer(tokenPayload: TokenCustomerPayload) {
    return await this.prisma.pointAccumulation.findUnique({
      where: {
        customerId: tokenPayload.customerId,
      },
    });
  }

  async getPointByShop(where: Prisma.PointAccumulationWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.pointAccumulation.findUnique({
      where: { customerId: where.customerId, shopId: tokenPayload.shopId },
    });
  }

  async handleAddPoint(
    customerId: string,
    orderId: string,
    totalOrder: number,
    tokenPayload: TokenPayload,
    prisma?: PrismaClient,
  ) {
    prisma = prisma || this.prisma;

    const settingPoint = await prisma.pointSetting.findFirst({
      where: {
        shopId: tokenPayload.shopId,
        active: true,
      },
    });

    if (!settingPoint) return;

    const point = Math.floor((totalOrder * settingPoint.point) / settingPoint.value);

    await prisma.pointAccumulation.upsert({
      create: {
        customerId,
        point,
        shopId: tokenPayload.shopId,
      },
      update: {
        point: {
          increment: point,
        },
      },
      where: { shopId: tokenPayload.shopId, customerId: customerId },
    });

    await prisma.pointHistory.create({
      data: {
        customerId,
        orderId,
        point,
        type: POINT_TYPE.ADD,
        shopId: tokenPayload.shopId,
      },
    });
  }

  async handleExchangePoint(
    customerId: string,
    orderId: string,
    exchangePoint: number,
    tokenPayload: TokenPayload,
    prisma?: PrismaClient,
  ) {
    prisma = prisma || this.prisma;

    const settingPoint = await prisma.pointSetting.findFirst({
      where: {
        shopId: tokenPayload.shopId,
        active: true,
      },
    });

    if (!settingPoint || !exchangePoint) return;

    const currentPoint = await prisma.pointAccumulation.findUnique({
      where: { customerId },
      select: {
        id: true,
        point: true,
      },
    });

    if (!currentPoint || currentPoint.point < exchangePoint)
      throw new CustomHttpException(HttpStatus.CONFLICT, "#1 handleExchangePoint - Điểm đổi không hợp lệ!");

    const t = await prisma.pointAccumulation.update({
      data: {
        point: {
          decrement: exchangePoint,
        },
      },
      where: { shopId: tokenPayload.shopId, customerId: customerId },
    });

    await prisma.pointHistory.create({
      data: {
        customerId,
        orderId,
        point: exchangePoint,
        type: POINT_TYPE.EXCHANGE,
        shopId: tokenPayload.shopId,
      },
    });
  }

  async convertDiscountFromPoint(point: number, shopId: string) {
    if (!point) return 0;

    const settingPoint = await this.prisma.pointSetting.findFirst({
      where: {
        shopId: shopId,
        active: true,
      },
    });

    return Math.floor((point * settingPoint.value) / settingPoint.point);
  }
}
