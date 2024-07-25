import { Injectable } from "@nestjs/common";
import { CompensationSetting, Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { CreateCompensationEmployeeDto, UpdateCompensationEmployeeDto } from "./dto/compensation-employee.dto";
import { TokenPayload } from "interfaces/common.interface";
import { CommonService } from "src/common/common.service";
import { FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class CompensationEmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompensationEmployeeDto, tokenPayload: TokenPayload) {
    const compensationSettings = await this.prisma.compensationSetting.findMany({
      where: { branchId: tokenPayload.branchId, isPublic: true },
      select: { id: true, defaultValue: true, type: true },
    });

    const compensationSettingData = compensationSettings.map((compensationSetting: CompensationSetting) => ({
      employeeId: data.employeeId,
      compensationSettingId: compensationSetting.id,
      type: compensationSetting.type,
      value: compensationSetting.defaultValue,
      createdBy: tokenPayload.accountId,
      branchId: tokenPayload.branchId,
    })) as Prisma.CompensationEmployeeCreateManyInput[];

    return await this.prisma.$transaction(async (prisma) => {
      return prisma.compensationEmployee.createMany({ data: compensationSettingData });
    });
  }

  async update(
    params: {
      where: Prisma.CompensationEmployeeWhereUniqueInput;
      data: UpdateCompensationEmployeeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.compensationEmployee.update({
      where: { id: where.id },
      data: { value: data.value, updatedBy: tokenPayload.accountId },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, employeeIds } = params;
    let where: Prisma.CompensationEmployeeWhereInput = {
      ...(employeeIds && { employeeId: { in: employeeIds } }),
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.compensationEmployee.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          type: true,
          value: true,
          employeeId: true,
          compensationSetting: {
            select: { id: true, name: true, defaultValue: true, description: true },
          },
          updatedBy: true,
        },
      }),
      this.prisma.compensationEmployee.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }
}
