import { Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { Prisma } from "@prisma/client";
import { ReportCustomerDto, ReportProductDto, ReportSaleDto } from "./dto/report.dto";
import { groupBy } from "rxjs";

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async reportSale(params: ReportSaleDto, tokenPayload: TokenPayload) {
    const { from, to } = params;
    const where: Prisma.OrderWhereInput = {
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: from,
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    return this.prisma.order.findMany({
      where: where,
      include: {
        orderDetails: true,
      },
    });
  }

  async reportCustomer(params: ReportCustomerDto, tokenPayload: TokenPayload) {
    const { from, to } = params;

    const where: Prisma.CustomerWhereInput = {
      isPublic: true,
      shopId: tokenPayload.shopId,
      ...(from &&
        to && {
          createdAt: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
    };

    return this.prisma.customer.count({
      where,
    });
  }

  async reportProduct(params: ReportProductDto, tokenPayload: TokenPayload) {
    const where: Prisma.ProductTypeWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
    };

    return this.prisma.productType.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }
}
