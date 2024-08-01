import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { UpdatePaymentMethodDto } from "./dto/payment-method.dto";
import { TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { FindManyDto } from "utils/Common.dto";
import { database } from "firebase-admin";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: {
      data: UpdatePaymentMethodDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { data } = params;

    return this.prisma.paymentMethod.create({
      data: {
        active: data.active,
        bankCode: data.bankCode,
        bankName: data.bankName,
        photoURL: data.photoURL,
        createdBy: tokenPayload.accountId,
        type: data.type,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async update(
    params: {
      data: UpdatePaymentMethodDto;
      where: Prisma.PaymentMethodWhereUniqueInput;
    },
    tokenPayload: TokenPayload,
  ) {
    const { data, where } = params;

    return this.prisma.paymentMethod.update({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
      },
      data: {
        active: data.active,
        bankCode: data.bankCode,
        bankName: data.bankName,
        photoURL: data.photoURL,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findUniq(where: Prisma.PaymentMethodWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.paymentMethod.findUniqueOrThrow({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;
    const keySearch = ["bankName", "bankCode", "representative", "type"];

    let where: Prisma.PaymentMethodWhereInput = {
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.paymentMethod.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
      }),
      this.prisma.paymentMethod.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }
}
