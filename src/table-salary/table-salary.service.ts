import { HttpStatus, Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateTableSalaryDto, UpdateTableSalaryDto } from "./dto/table-salary.dto";
import { Prisma } from "@prisma/client";
import { CustomHttpException } from "utils/ApiErrors";
import { COMPENSATION_TYPE } from "enums/common.enum";

@Injectable()
export class TableSalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotValidEmployees(isFulltime: boolean, employeeIds: string[]) {
    const employeeSalaries = await this.prisma.employeeSalary.findMany({
      where: {
        isPublic: true,
        isFulltime: isFulltime,
        employeeId: { in: employeeIds },
      },
    });

    const employeeSalaryIds = employeeSalaries.map((e) => e.employeeId);

    if (employeeSalaries.length < employeeIds.length) return employeeIds.filter((e) => !employeeSalaryIds.includes(e));

    return [];
  }

  async getCompensationLabels(type: number, branchId: string) {
    return this.prisma.compensationSetting.findMany({
      where: { type, isPublic: true, branchId },
      select: { id: true, name: true, description: true },
    });
  }

  async getCompensationValues(type: number, employeeId: string) {
    const compensationEmployees = await this.prisma.compensationEmployee.findMany({
      where: { employeeId, type },
      select: { compensationSettingId: true, value: true },
    });

    return compensationEmployees.map((c) => ({ id: c.compensationSettingId, value: c.value }));
  }

  async getDetailSalaryByEmployeeId(employeeId: string) {
    return this.prisma.employeeSalary.findUnique({
      where: { employeeId },
      select: { id: true, baseSalary: true, isFulltime: true },
    });
  }

  async create(data: CreateTableSalaryDto, tokenPayload: TokenPayload) {
    const notValidIds = await this.getNotValidEmployees(data.isFulltime, data.employeeIds);

    if (notValidIds.length > 0)
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        "#1 create - Nhân viên chưa thiết lập mức lương hoặc không hợp lệ!",
        notValidIds,
      );

    const [allowanceLabel, deductionLabel] = await Promise.all([
      this.getCompensationLabels(COMPENSATION_TYPE.ALLOWANCE, tokenPayload.branchId),
      this.getCompensationLabels(COMPENSATION_TYPE.DEDUCTION, tokenPayload.branchId),
    ]);

    await this.prisma.$transaction(async (prisma) => {
      const tableSalary = await prisma.tableSalary.create({
        data: {
          name: data.name,
          description: data.description,
          isFulltime: data.isFulltime,
          allowanceLabel,
          deductionLabel,
          branchId: tokenPayload.branchId,
        },
      });

      const detailTableSalaryData = await data.employeeIds.map(async (employeeId) => {
        const [allowanceValue, deductionValue] = await Promise.all([
          this.getCompensationValues(COMPENSATION_TYPE.ALLOWANCE, employeeId),
          this.getCompensationValues(COMPENSATION_TYPE.DEDUCTION, employeeId),
        ]);

        const employeeSalary = await this.getDetailSalaryByEmployeeId(employeeId);

        return {
          tableSalaryId: tableSalary.id,
          allowanceValue,
          deductionValue,
          baseSalary: employeeSalary.baseSalary,
          workDay: data.workDay,
          employeeId,
          branchId: tokenPayload.branchId,
        };
      });
    });
  }

  async update(
    params: {
      where: Prisma.TableSalaryWhereUniqueInput;
      data: UpdateTableSalaryDto;
    },
    tokenPayload: TokenPayload,
  ) {}
}
