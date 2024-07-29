import { HttpStatus, Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateTableSalaryDto, UpdateTableSalaryDto } from "./dto/table-salary.dto";
import { Prisma } from "@prisma/client";
import { CustomHttpException } from "utils/ApiErrors";
import { COMPENSATION_APPLY_TO, COMPENSATION_TYPE } from "enums/common.enum";
import { FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

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

  async getCompensationLabels(isFulltime: boolean, type: number, branchId: string) {
    return this.prisma.compensationSetting.findMany({
      where: {
        type,
        isPublic: true,
        branchId,
        OR: [
          { applyTo: COMPENSATION_APPLY_TO.ALL },
          { applyTo: isFulltime ? COMPENSATION_APPLY_TO.FULLTIME : COMPENSATION_APPLY_TO.PART_TIME },
        ],
      },
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

  async getTotalHoursBySchedule(from: Date, to: Date, employeeId: string, isFulltime: boolean) {
    if (isFulltime) return;

    const workShifts = await this.prisma.employeeSchedule.findMany({
      where: {
        employeeId,
        isPublic: true,
        AND: [
          {
            date: {
              gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
            },
          },
          {
            date: {
              lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
            },
          },
        ],
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    return workShifts.reduce((total, shift) => {
      let workTime = 0;
      if (shift.endTime >= shift.startTime) {
        workTime = shift.endTime - shift.startTime;
      } else {
        workTime = 24 - shift.startTime + shift.endTime;
      }
      return total + workTime;
    }, 0);
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
      this.getCompensationLabels(data.isFulltime, COMPENSATION_TYPE.ALLOWANCE, tokenPayload.branchId),
      this.getCompensationLabels(data.isFulltime, COMPENSATION_TYPE.DEDUCTION, tokenPayload.branchId),
    ]);

    return await this.prisma.$transaction(async (prisma) => {
      const tableSalary = await prisma.tableSalary.create({
        data: {
          name: data.name,
          description: data.description,
          isFulltime: data.isFulltime,
          allowanceLabel,
          deductionLabel,
          createdBy: tokenPayload.accountId,
          branchId: tokenPayload.branchId,
        },
      });

      const notCompensationEmployees = [];

      const detailTableSalaryData: Prisma.DetailTableSalaryCreateManyInput[] = await Promise.all(
        data.employeeIds.map(async (employeeId) => {
          const [allowanceValue, deductionValue, employeeSalary, totalHours] = await Promise.all([
            this.getCompensationValues(COMPENSATION_TYPE.ALLOWANCE, employeeId),
            this.getCompensationValues(COMPENSATION_TYPE.DEDUCTION, employeeId),
            this.getDetailSalaryByEmployeeId(employeeId),
            this.getTotalHoursBySchedule(data.from, data.to, employeeId, data.isFulltime),
          ]);

          if (allowanceValue.length != allowanceLabel.length || deductionLabel.length != deductionValue.length)
            notCompensationEmployees.push(employeeId);

          return {
            tableSalaryId: tableSalary.id,
            allowanceValue,
            deductionValue,
            totalHours,
            baseSalary: employeeSalary.baseSalary,
            workDay: data.workDay,
            employeeId,
            branchId: tokenPayload.branchId,
          };
        }),
      );

      if (notCompensationEmployees.length > 0)
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          "#2 create - Chưa thiết lập thông tin phụ cấp - khoản trừ!",
          { employeeIds: notCompensationEmployees },
        );

      await prisma.detailTableSalary.createMany({
        data: detailTableSalaryData,
      });

      return tableSalary;
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take } = params;

    let where: Prisma.TableSalaryWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.tableSalary.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          isFulltime: true,
          isConfirm: true,
          confirmBy: true,
          updatedAt: true,
        },
      }),
      this.prisma.tableSalary.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.TableSalaryWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.tableSalary.findUniqueOrThrow({
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      include: {
        detailTableSalaries: {
          select: {
            allowanceValue: true,
            deductionValue: true,
            totalHours: true,
            baseSalary: true,
            workDay: true,
            employee: {
              select: {
                name: true,
                code: true,
                phone: true,
                photoURL: true,
              },
            },
          },
        },
      },
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
