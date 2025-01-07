import { HttpStatus, Injectable } from "@nestjs/common";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { FindManyEmployeeScheduleDto, RegisterScheduleDto, UpdateRegisterScheduleDto } from "./dto/employee.schedule.dto";
import { Prisma } from "@prisma/client";
import { DeleteManyDto } from "utils/Common.dto";
import { PrismaService } from "nestjs-prisma";
import { ACCOUNT_TYPE } from "enums/user.enum";
import { CustomHttpException } from "utils/ApiErrors";
import { customPaginate } from "utils/Helps";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class EmployeeScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async registerSchedule(data: RegisterScheduleDto, tokenPayload: TokenPayload) {
    const workShift = await this.getAndCheckLimitWorkShift(data.workShiftId);

    const result = await this.prisma.employeeSchedule.create({
      data: {
        startTime: workShift.startTime,
        endTime: workShift.endTime,
        date: data.date,
        workShiftId: data.workShiftId,
        employeeId: tokenPayload.userId,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(
      [result.id],
      "EmployeeSchedule",
      ACTIVITY_LOG_TYPE.REGISTER,
      tokenPayload,
    );

    return result;
  }

  async update(
    params: { data: UpdateRegisterScheduleDto; where: Prisma.EmployeeScheduleWhereUniqueInput },
    tokenPayload: TokenPayload,
  ) {
    const { data, where } = params;

    const workShift = await this.getAndCheckLimitWorkShift(data.workShiftId, where.id);

    const validIds = await this.filterValidRegisterSchedule([where.id], tokenPayload);

    if (tokenPayload.type === ACCOUNT_TYPE.STAFF && validIds.length == 0)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Không thể cập nhật dữ liệu này!");

    const result = await this.prisma.employeeSchedule.update({
      where: {
        id: where.id,
        isPublic: true,
      },
      data: {
        startTime: workShift.startTime,
        endTime: workShift.endTime,
        date: data.date,
        workShiftId: data.workShiftId,
        employeeId: tokenPayload.userId,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog([result.id], "EmployeeSchedule", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyEmployeeScheduleDto, tokenPayload: TokenPayload) {
    let { page, perPage, from, to, employeeIds, workShiftIds, keyword, orderBy } = params;
    const keySearch = ["name"];

    let where: Prisma.EmployeeScheduleWhereInput = {
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
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

    return await customPaginate(
      this.prisma.employeeSchedule,
      {
        orderBy: orderBy || { createdAt: "desc" },
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
      },
      {
        page,
        perPage,
      },
    );
  }

  async findUniq(where: Prisma.EmployeeScheduleWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.employeeSchedule.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
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

    await this.commonService.createActivityLog(validIds, "EmployeeSchedule", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

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

    return employeeSchedules.map((employeeSchedule) => employeeSchedule.id);
  }

  async getAndCheckLimitWorkShift(workShiftId: string, employeeScheduleId?: string) {
    const countEmployee = await this.prisma.employeeSchedule.count({
      where: {
        ...{ id: { not: employeeScheduleId } },
        workShiftId,
        isPublic: true,
      },
    });

    const workShift = await this.prisma.workShift.findFirstOrThrow({
      where: { id: workShiftId },
    });

    if (!workShift.isNotLimitEmployee && countEmployee >= workShift.limitEmployee)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Đã vượt quá số lượng!");

    return workShift;
  }
}
