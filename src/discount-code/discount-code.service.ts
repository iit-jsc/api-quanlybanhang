import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateDiscountCodeDto } from './dto/discount-code.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination, generateSortCode } from 'utils/Helps';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class DiscountCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDiscountCodeDto, tokenPayload: TokenPayload) {
    const discountCodeData = [];

    await this.checkAmountValid(data.amount, data.discountIssueId);

    for (let i = 0; i < data.amount; i++) {
      discountCodeData.push({
        code: `${data.prefix || ''}${generateSortCode()}${data.suffixes || ''}`,
        branchId: tokenPayload.branchId,
        discountIssueId: data.discountIssueId,
        createdBy: tokenPayload.accountId,
      });
    }

    return this.prisma.discountCode.createMany({ data: discountCodeData });
  }

  async checkAmountValid(amount: number, discountIssueId: string) {
    const discountIssue = await this.prisma.discountIssue.findUnique({
      where: { id: discountIssueId, isPublic: true },
    });

    const currentAmount = await this.prisma.discountCode.count({
      where: { isPublic: true, discountIssueId },
    });

    if (amount + currentAmount > discountIssue.amount)
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkAmountValid - Số lượng vượt quá đợt khuyến mãi!',
        [],
        { currentAmount, maxAmount: discountIssue.amount },
      );
  }

  async deleteMany(
    where: Prisma.DiscountCodeWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.discountCode.updateMany({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;
    let where: Prisma.DiscountCodeWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.discountCode.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
      }),
      this.prisma.discountCode.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.DiscountCodeWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.discountCode.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }
}