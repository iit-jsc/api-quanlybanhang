import { Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateEmployeeSalaryDto, FindManyEmployeeSalaryDto, UpdateEmployeeSalaryDto } from "./dto/employee-salary.dto";
import { CompensationSetting, Prisma } from "@prisma/client";
import { customPaginate } from "utils/Helps";
import { CreateCompensationEmployeeDto } from "src/compensation-employee/dto/compensation-employee.dto";
import { ACTIVITY_LOG_TYPE, COMPENSATION_APPLY_TO } from "enums/common.enum";
import { CommonService } from "src/common/common.service";

@Injectable()
export class EmployeeSalaryService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async create(data: CreateEmployeeSalaryDto, tokenPayload: TokenPayload) {
    await this.createCompensation(data.isFulltime, { employeeId: data.employeeId }, tokenPayload);

    const result = await this.prisma.employeeSalary.create({
      data: {
        employeeId: data.employeeId,
        baseSalary: data.baseSalary,
        isFulltime: data.isFulltime,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog([result.id], "EmployeeSalary", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async createCompensation(isFulltime: boolean, data: CreateCompensationEmployeeDto, tokenPayload: TokenPayload) {
    const compensationSettings = await this.prisma.compensationSetting.findMany({
      where: {
        branchId: tokenPayload.branchId,
        isPublic: true,
        OR: [
          { applyTo: COMPENSATION_APPLY_TO.ALL },
          { applyTo: isFulltime ? COMPENSATION_APPLY_TO.FULLTIME : COMPENSATION_APPLY_TO.PART_TIME },
        ],
      },
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
    params: { data: UpdateEmployeeSalaryDto; where: Prisma.EmployeeSalaryWhereUniqueInput },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const result = await this.prisma.employeeSalary.update({
      data: {
        employeeId: data.employeeId,
        baseSalary: data.baseSalary,
        isFulltime: data.isFulltime,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });

    await this.commonService.createActivityLog([result.id], "EmployeeSalary", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyEmployeeSalaryDto, tokenPayload: TokenPayload) {
    let { page, perPage, employeeIds, isFulltime, orderBy } = params;

    let where: Prisma.EmployeeSalaryWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      isFulltime,
      ...(employeeIds && { employeeId: { in: employeeIds } }),
    };

    return await customPaginate(
      this.prisma.employeeSalary,
      {
        orderBy: orderBy || { createdAt: "desc" },
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
          updatedAt: true,
        },
      },
      {
        page,
        perPage,
      },
    );

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
        updatedAt: true,
      },
    });
  }
}
