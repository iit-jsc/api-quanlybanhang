import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { ReportSaleDto } from './dto/report-customer.dto';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';

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
}
