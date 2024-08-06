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

  async handleAddPoint(customerId: string, orderId: string, point: number, shopId: string, prisma?: PrismaClient) {
    const pointAccumulation = prisma.pointAccumulation.upsert({
      create: {
        customerId,
        point,
        shopId: shopId,
      },
      update: {
        point: {
          increment: point,
        },
      },
      where: { shopId: shopId, customerId: customerId },
    });

    const pointHistory = prisma.pointHistory.create({
      data: {
        customerId,
        orderId,
        point,
        type: POINT_TYPE.ADD,
        shopId: shopId,
      },
    });

    await Promise.all([pointAccumulation, pointHistory]);
  }

  async handleExchangePoint(
    customerId: string,
    orderId: string,
    exchangePoint: number,
    shopId: string,
    prisma?: PrismaClient,
  ) {
    prisma = prisma || this.prisma;

    const pointAccumulation = prisma.pointAccumulation.update({
      data: {
        point: {
          decrement: exchangePoint || 0,
        },
      },
      where: { shopId: shopId, customerId: customerId },
    });

    const pointHistory = prisma.pointHistory.create({
      data: {
        customerId,
        orderId,
        point: exchangePoint || 0,
        type: POINT_TYPE.EXCHANGE,
        shopId: shopId,
      },
    });

    await Promise.all([pointAccumulation, pointHistory]);
  }

  async handlePoint(
    customerId: string,
    orderId: string,
    exchangePoint: number,
    totalInOrder: number,
    shopId: string,
    prisma: PrismaClient,
  ) {
    const pointSetting = await this.prisma.pointSetting.findFirst({
      where: {
        shopId: shopId,
        active: true,
      },
    });

    if (!pointSetting) return;

    // Xử lý đổi điểm
    if (exchangePoint) {
      // Quy đổi số tiền
      const convertedPointValue = (exchangePoint * pointSetting.value) / pointSetting.point;

      const currentPoint = await this.prisma.pointAccumulation.findUnique({
        where: { customerId },
        select: {
          id: true,
          point: true,
        },
      });

      if (!currentPoint || currentPoint.point < exchangePoint || convertedPointValue > totalInOrder)
        throw new CustomHttpException(HttpStatus.CONFLICT, "Điểm đổi không hợp lệ!");

      await this.handleExchangePoint(customerId, orderId, exchangePoint, shopId, prisma);
    }

    //  Xử lý cộng điểm
    const point = Math.floor((totalInOrder * pointSetting.point) / pointSetting.value) || 0;

    await this.handleAddPoint(customerId, orderId, point, shopId, prisma);
  }

  async checkValidExchangePoint(customerId: string, exchangePoint: number, totalInOrder: number, shopId: string) {
    const pointSetting = await this.prisma.pointSetting.findFirst({
      where: {
        shopId: shopId,
        active: true,
      },
    });

    if (!pointSetting || !exchangePoint) return false;

    const currentPoint = await this.prisma.pointAccumulation.findUnique({
      where: { customerId },
      select: {
        id: true,
        point: true,
      },
    });

    // Quy đổi số tiền
    const convertedPointValue = (exchangePoint * pointSetting.value) / pointSetting.point;

    if (!currentPoint || currentPoint.point < exchangePoint || convertedPointValue > totalInOrder)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Điểm đổi không hợp lệ!");
  }

  async convertDiscountFromPoint(point: number, shopId: string) {
    const pointSetting = await this.prisma.pointSetting.findFirst({
      where: {
        shopId: shopId,
        active: true,
      },
    });

    if (!point || !pointSetting) return 0;

    return Math.floor((point * pointSetting.value) / pointSetting.point);
  }
}
