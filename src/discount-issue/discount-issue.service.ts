import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateDiscountIssueDto,
  UpdateDiscountIssueDto,
} from './dto/discount-issue.dto';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class DiscountIssueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDiscountIssueDto, tokenPayload: TokenPayload) {
    return await this.prisma.discountIssue.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        value: data.value,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        description: data.description,
        amount: data.amount,
        isLimit: data.isLimit,
        amountCustomer: data.amountCustomer,
        isLimitCustomer: data.isLimitCustomer,
        otherDiscountApplied: data.otherDiscountApplied,
        minTotalOrder: data.minTotalOrder,
        maxValue: data.maxValue,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });
  }

  async update(
    params: {
      where: Prisma.DiscountIssueWhereUniqueInput;
      data: UpdateDiscountIssueDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.discountIssue.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        value: data.value,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        description: data.description,
        amount: data.amount,
        isLimit: data.isLimit,
        amountCustomer: data.amountCustomer,
        isLimitCustomer: data.isLimitCustomer,
        otherDiscountApplied: data.otherDiscountApplied,
        minTotalOrder: data.minTotalOrder,
        maxValue: data.maxValue,
        branchId: tokenPayload.branchId,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;
    let where: Prisma.DiscountIssueWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      branchId: tokenPayload.branchId,
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.discountIssue.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
      }),
      this.prisma.discountIssue.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.DiscountIssueWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.discountIssue.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async deleteMany(
    where: Prisma.DiscountIssueWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.discountIssue.updateMany({
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
}
