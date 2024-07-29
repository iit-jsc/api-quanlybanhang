import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { UpdateCompensationEmployeeDto } from "./dto/compensation-employee.dto";
import { TokenPayload } from "interfaces/common.interface";
import { FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class CompensationEmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    params: {
      where: Prisma.CompensationEmployeeWhereUniqueInput;
      data: UpdateCompensationEmployeeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.compensationEmployee.update({
      where: { id: where.id, branchId: tokenPayload.branchId },
      data: { value: data.value, updatedBy: tokenPayload.accountId },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, employeeIds } = params;
    let where: Prisma.CompensationEmployeeWhereInput = {
      ...(employeeIds && { employeeId: { in: employeeIds } }),
      branchId: tokenPayload.branchId,
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
            select: { id: true, name: true, defaultValue: true, description: true, applyTo: true },
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
