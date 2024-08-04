import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateDiscountIssueDto, UpdateDiscountIssueDto } from "./dto/discount-issue.dto";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";
import { CommonService } from "src/common/common.service";

@Injectable()
export class DiscountIssueService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateDiscountIssueDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch({ code: data.code }, "DiscountIssue", tokenPayload.branchId);

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

    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      "DiscountIssue",
      tokenPayload.branchId,
      where.id,
    );

    return await this.prisma.discountIssue.update({
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
        minTotalOrder: data.minTotalOrder,
        maxValue: data.maxValue,
        branchId: tokenPayload.branchId,
        updatedBy: tokenPayload.accountId,
      },
      where: { id: where.id, isPublic: true, branchId: tokenPayload.branchId },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy } = params;
    let where: Prisma.DiscountIssueWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
      branchId: tokenPayload.branchId,
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.discountIssue.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
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

  async findUniq(where: Prisma.DiscountIssueWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.discountIssue.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.discountIssue.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
