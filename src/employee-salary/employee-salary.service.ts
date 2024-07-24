import { Injectable } from "@nestjs/common";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateEmployeeSalaryDto, UpdateEmployeeSalaryDto } from "./dto/employee-salary.dto";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class EmployeeSalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmployeeSalaryDto, tokenPayload: TokenPayload) {
    return this.prisma.employeeSalary.create({
      data: {
        employeeId: data.employeeId,
        baseSalary: data.baseSalary,
        isFulltime: data.isFulltime,
        salaryType: data.salaryType,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });
  }

  async update(
    params: { data: UpdateEmployeeSalaryDto; where: Prisma.EmployeeSalaryWhereUniqueInput },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.employeeSalary.update({
      data: {
        employeeId: data.employeeId,
        baseSalary: data.baseSalary,
        isFulltime: data.isFulltime,
        salaryType: data.salaryType,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, employeeIds, isFulltime } = params;

    let where: Prisma.EmployeeSalaryWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      isFulltime,
      ...(employeeIds && { employeeId: { in: employeeIds } }),
    };

    console.log(where);

    const [data, totalRecords] = await Promise.all([
      this.prisma.employeeSalary.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          baseSalary: true,
          employee: {
            select: {
              id: true,
              name: true,
              code: true,
              phone: true,
              photoURL: true,
            },
          },
          isFulltime: true,
          salaryType: true,
          updatedAt: true,
        },
      }),
      this.prisma.employeeSalary.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.EmployeeSalaryWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.employeeSalary.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        baseSalary: true,
        employee: {
          select: {
            id: true,
            name: true,
            code: true,
            phone: true,
            photoURL: true,
          },
        },
        isFulltime: true,
        salaryType: true,
        updatedAt: true,
      },
    });
  }
}
