import { Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { Prisma } from "@prisma/client";
import {
  ReportCustomerDto,
  ReportEmployeeDto,
  ReportProductDto,
  reportRevenueDto,
  ReportWareHouseDto,
} from "./dto/report.dto";
import { REPORT_REVENUE_TYPE, TIME_TYPE } from "enums/common.enum";
import { ACCOUNT_TYPE } from "enums/user.enum";

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async reportRevenue(params: reportRevenueDto, tokenPayload: TokenPayload) {
    const { from, to, type, timeType, hourStart, hourEnd } = params;

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
      isPaid: true,
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    if (type == REPORT_REVENUE_TYPE.TOTAL_ORDER)
      return this.prisma.order.count({
        where: where,
      });

    if (type == REPORT_REVENUE_TYPE.TOTAL_REVENUE) {
      const startDate = new Date(new Date(from).setHours(0, 0, 0, 0));
      const endDate = new Date(new Date(to).setHours(23, 59, 59, 999));

      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();

      let dateFormat: string;
      let timeCondition = "";

      switch (timeType) {
        case TIME_TYPE.DAY:
          dateFormat = "YYYY-MM-DD";
          break;
        case TIME_TYPE.MONTH:
          dateFormat = "YYYY-MM";
          break;
        case TIME_TYPE.YEAR:
          dateFormat = "YYYY";
          break;
        case TIME_TYPE.HOUR:
          dateFormat = "YYYY-MM-DD";
          timeCondition = `
              AND EXTRACT(HOUR FROM "o"."createdAt") >= ${hourStart}
              AND EXTRACT(HOUR FROM "o"."createdAt") <= ${hourEnd}
            `;
          break;
        default:
          throw new Error("Invalid time granularity");
      }

      const revenueData = await this.prisma.$queryRaw`
        SELECT 
          TO_CHAR("o"."createdAt", ${dateFormat}) AS period, 
          SUM(("od"."productPrice" + COALESCE("od"."toppingPrice", 0)) * "od"."amount") AS revenue
        FROM "Order" "o"
        JOIN "OrderDetail" "od" ON "o"."id" = "od"."orderId"
        WHERE "o"."isPaid" = true
          AND "o"."isPublic" = true
          AND "o"."branchId" = ${tokenPayload.branchId}
          AND "o"."createdAt" >= ${startDateString}::timestamp
          AND "o"."createdAt" <= ${endDateString}::timestamp
          ${Prisma.sql([timeCondition])}
        GROUP BY period
        ORDER BY period;
      `;

      return revenueData;
    }
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

  async reportWarehouse(params: ReportWareHouseDto, tokenPayload: TokenPayload) {
    const where: Prisma.WarehouseWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
    };

    return this.prisma.warehouse.findMany({
      where,
      select: {
        id: true,
        name: true,
        photoURLs: true,
        stocks: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });
  }

  async reportEmployee(params: ReportEmployeeDto, tokenPayload: TokenPayload) {
    const where: Prisma.UserWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      account: {
        type: ACCOUNT_TYPE.STAFF,
      },
    };

    return this.prisma.user.count({
      where,
    });
  }
}
