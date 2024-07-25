import { HttpStatus, Injectable } from "@nestjs/common";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { RegisterScheduleDto, UpdateRegisterScheduleDto } from "./dto/employee.schedule.dto";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { PrismaService } from "nestjs-prisma";
import { ACCOUNT_TYPE } from "enums/user.enum";
import { CustomHttpException } from "utils/ApiErrors";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class EmployeeScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async registerSchedule(data: RegisterScheduleDto, tokenPayload: TokenPayload) {
    await this.checkLimitEmployee(data.workShiftId);

    return this.prisma.employeeSchedule.create({
      data: {
        date: data.date,
        workShiftId: data.workShiftId,
        employeeId: tokenPayload.userId,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });
  }

  async update(
    params: { data: UpdateRegisterScheduleDto; where: Prisma.EmployeeScheduleWhereUniqueInput },
    tokenPayload: TokenPayload,
  ) {
    const { data, where } = params;

    await this.checkLimitEmployee(data.workShiftId, where.id);

    const validIds = await this.filterValidRegisterSchedule([where.id], tokenPayload);

    console.log(validIds);

    if (tokenPayload.type === ACCOUNT_TYPE.STAFF && validIds.length == 0)
      throw new CustomHttpException(HttpStatus.CONFLICT, "#1 update - Không thể cập nhật dữ liệu này!");

    return this.prisma.employeeSchedule.update({
      where: {
        id: where.id,
        isPublic: true,
      },
      data: {
        date: data.date,
        workShiftId: data.workShiftId,
        employeeId: tokenPayload.userId,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, from, to, employeeIds, workShiftIds, keyword } = params;
    const keySearch = ["name"];

    let where: Prisma.EmployeeScheduleWhereInput = {
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
      ...(employeeIds?.length > 0 && {
        employeeId: { in: employeeIds },
      }),
      ...(workShiftIds?.length > 0 && {
        workShiftId: { in: workShiftIds },
      }),
      ...(from &&
        to && {
          date: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          date: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
          },
        }),
      ...(!from &&
        to && {
          date: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      isPublic: true,
      branchId: tokenPayload.branchId,
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.employeeSchedule.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          date: true,
          workShift: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
            },
          },
          employee: {
            select: {
              id: true,
              name: true,
              code: true,
              photoURL: true,
              phone: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.employeeSchedule.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.EmployeeScheduleWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.employeeSchedule.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      include: {
        workShift: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            code: true,
            photoURL: true,
            phone: true,
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload): Promise<DeleteManyResponse> {
    const validIds = await this.filterValidRegisterSchedule(data.ids, tokenPayload);
    const notValidIds = data.ids.filter((id) => !validIds.includes(id));

    const isStaff = tokenPayload.type === ACCOUNT_TYPE.STAFF;
    const idsToUpdate = isStaff ? validIds : data.ids;

    const count = await this.prisma.employeeSchedule.updateMany({
      where: {
        id: { in: idsToUpdate },
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return isStaff ? { ...count, ids: validIds, notValidIds } : { ...count, ids: data.ids };
  }

  async filterValidRegisterSchedule(employeeScheduleIds: string[], tokenPayload: TokenPayload) {
    const employeeSchedules = await this.prisma.employeeSchedule.findMany({
      where: {
        id: { in: employeeScheduleIds },
        employeeId: tokenPayload.userId,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      select: {
        id: true,
      },
    });

    console.log(employeeSchedules);

    return employeeSchedules.map((employeeSchedule) => employeeSchedule.id);
  }

  async checkLimitEmployee(workShiftId: string, employeeScheduleId?: string) {
    const countEmployee = await this.prisma.employeeSchedule.count({
      where: {
        ...{ id: { not: employeeScheduleId } },
        workShiftId,
        isPublic: true,
      },
    });

    const workShift = await this.prisma.workShift.findFirstOrThrow({ where: { id: workShiftId } });

    if (!workShift.isNotLimitEmployee && countEmployee >= workShift.limitEmployee)
      throw new CustomHttpException(HttpStatus.CONFLICT, "#1 checkLimitEmployee - Đã vượt quá số lượng!");
  }
}
