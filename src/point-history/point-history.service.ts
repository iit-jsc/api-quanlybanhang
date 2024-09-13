import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TokenCustomerPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class PointHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyPointHistory(tokenPayload: TokenCustomerPayload) {
    return this.prisma.pointHistory.findMany({
      where: {
        customerId: tokenPayload.customerId,
      },
      select: {
        id: true,
        point: true,
        createdAt: true,
        type: true,
        order: {
          select: {
            id: true,
            code: true,
            isPaid: true,
            orderStatus: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                address: true,
                email: true,
              },
            },
            orderDetails: {
              select: {
                id: true,
                amount: true,
                note: true,
                product: true,
                productOptions: true,
              },
              where: {
                isPublic: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findUniqPointerHistory(where: Prisma.PointHistoryWhereUniqueInput, tokenPayload: TokenCustomerPayload) {
    return this.prisma.pointHistory.findUniqueOrThrow({
      where: {
        id: where.id,
        customerId: tokenPayload.customerId,
      },
      include: {
        order: {
          include: {
            orderDetails: {
              where: {
                isPublic: true,
              },
            },
          },
        },
      },
    });
  }
}
