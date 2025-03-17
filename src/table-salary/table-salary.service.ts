import { HttpStatus, Injectable } from '@nestjs/common'
import { DeleteManyResponse, TokenPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateTableSalaryDto,
  UpdateTableSalaryDto
} from './dto/table-salary.dto'
import { Prisma } from '@prisma/client'
import { CustomHttpException } from 'utils/ApiErrors'
import {
  ACTIVITY_LOG_TYPE,
  COMPENSATION_APPLY_TO,
  COMPENSATION_TYPE
} from 'enums/common.enum'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { customPaginate } from 'utils/Helps'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class TableSalaryService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService
  ) {}

  // async getNotValidEmployees(isFulltime: boolean, employeeIds: string[]) {
  //   const employeeSalaries = await this.prisma.employeeSalary.findMany({
  //     where: {
  //       isPublic: true,
  //       isFulltime: isFulltime,
  //       employeeId: { in: employeeIds },
  //     },
  //   });

  //   const employeeSalaryIds = employeeSalaries.map((e) => e.employeeId);

  //   if (employeeSalaries.length < employeeIds.length) return employeeIds.filter((e) => !employeeSalaryIds.includes(e));

  //   return [];
  // }

  // async getCompensationLabels(isFulltime: boolean, type: number, branchId: string) {
  //   return this.prisma.compensationSetting.findMany({
  //     where: {
  //       type,
  //       isPublic: true,
  //       branchId,
  //       OR: [
  //         { applyTo: COMPENSATION_APPLY_TO.ALL },
  //         { applyTo: isFulltime ? COMPENSATION_APPLY_TO.FULLTIME : COMPENSATION_APPLY_TO.PART_TIME },
  //       ],
  //     },
  //     select: { id: true, name: true, description: true },
  //   });
  // }

  // async getCompensationValues(type: number, employeeId: string) {
  //   const compensationEmployees = await this.prisma.compensationEmployee.findMany({
  //     where: { employeeId, type },
  //     select: { compensationSettingId: true, value: true },
  //   });

  //   return compensationEmployees.map((c) => ({ id: c.compensationSettingId, value: c.value }));
  // }

  // async getDetailSalaryByEmployeeId(employeeId: string) {
  //   return this.prisma.employeeSalary.findUnique({
  //     where: { employeeId },
  //     select: { id: true, baseSalary: true, isFulltime: true },
  //   });
  // }

  // async getTotalHoursBySchedule(from: Date, to: Date, employeeId: string, isFulltime: boolean) {
  //   if (isFulltime) return;

  //   const workShifts = await this.prisma.employeeSchedule.findMany({
  //     where: {
  //       employeeId,
  //       isPublic: true,
  //       AND: [
  //         {
  //           date: {
  //             gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
  //           },
  //         },
  //         {
  //           date: {
  //             lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
  //           },
  //         },
  //       ],
  //     },
  //     select: {
  //       startTime: true,
  //       endTime: true,
  //     },
  //   });

  //   return workShifts.reduce((total, shift) => {
  //     let workTime = 0;
  //     if (shift.endTime >= shift.startTime) {
  //       workTime = shift.endTime - shift.startTime;
  //     } else {
  //       workTime = 24 - shift.startTime + shift.endTime;
  //     }
  //     return total + workTime;
  //   }, 0);
  // }

  // async create(data: CreateTableSalaryDto, tokenPayload: TokenPayload) {
  //   const notValidIds = await this.getNotValidEmployees(data.isFulltime, data.employeeIds);

  //   if (notValidIds.length > 0)
  //     throw new CustomHttpException(
  //       HttpStatus.CONFLICT,
  //       "Nhân viên chưa thiết lập mức lương hoặc không hợp lệ!",
  //       notValidIds,
  //     );

  //   const [allowanceLabel, deductionLabel] = await Promise.all([
  //     this.getCompensationLabels(data.isFulltime, COMPENSATION_TYPE.ALLOWANCE, tokenPayload.branchId),
  //     this.getCompensationLabels(data.isFulltime, COMPENSATION_TYPE.DEDUCTION, tokenPayload.branchId),
  //   ]);

  //   return await this.prisma.$transaction(async (prisma) => {
  //     const tableSalary = await prisma.tableSalary.create({
  //       data: {
  //         name: data.name,
  //         description: data.description,
  //         isFulltime: data.isFulltime,
  //         allowanceLabel,
  //         deductionLabel,
  //         createdBy: tokenPayload.accountId,
  //         branchId: tokenPayload.branchId,
  //       },
  //     });

  //     const notCompensationEmployees = [];

  //     const detailTableSalaryData: Prisma.DetailTableSalaryCreateManyInput[] = await Promise.all(
  //       data.employeeIds.map(async (employeeId) => {
  //         const [allowanceValue, deductionValue, employeeSalary, totalHours] = await Promise.all([
  //           this.getCompensationValues(COMPENSATION_TYPE.ALLOWANCE, employeeId),
  //           this.getCompensationValues(COMPENSATION_TYPE.DEDUCTION, employeeId),
  //           this.getDetailSalaryByEmployeeId(employeeId),
  //           this.getTotalHoursBySchedule(data.from, data.to, employeeId, data.isFulltime),
  //         ]);

  //         if (allowanceValue.length != allowanceLabel.length || deductionLabel.length != deductionValue.length)
  //           notCompensationEmployees.push(employeeId);

  //         return {
  //           tableSalaryId: tableSalary.id,
  //           allowanceValue,
  //           deductionValue,
  //           totalHours,
  //           baseSalary: employeeSalary.baseSalary,
  //           workDay: data.workDay,
  //           employeeId,
  //           branchId: tokenPayload.branchId,
  //         };
  //       }),
  //     );

  //     if (notCompensationEmployees.length > 0)
  //       throw new CustomHttpException(HttpStatus.CONFLICT, "Chưa thiết lập thông tin phụ cấp - khoản trừ!", {
  //         employeeIds: notCompensationEmployees,
  //       });

  //     await prisma.detailTableSalary.createMany({
  //       data: detailTableSalaryData,
  //     });

  //     await this.commonService.createActivityLog(
  //       [tableSalary.id],
  //       "TableSalary",
  //       ACTIVITY_LOG_TYPE.CREATE,
  //       tokenPayload,
  //     );

  //     return tableSalary;
  //   });
  // }

  // async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
  //   let { page, perPage, orderBy } = params;

  //   let where: Prisma.TableSalaryWhereInput = {
  //     isPublic: true,
  //     branchId: tokenPayload.branchId,
  //   };

  //   return await customPaginate(
  //     this.prisma.tableSalary,
  //     {
  //       orderBy: orderBy || { createdAt: "desc" },
  //       where,
  //       select: {
  //         id: true,
  //         name: true,
  //         description: true,
  //         isFulltime: true,
  //         isConfirm: true,
  //         confirmBy: true,
  //         updatedAt: true,
  //       },
  //     },
  //     {
  //       page,
  //       perPage,
  //     },
  //   );

  // }

  // async findUniq(where: Prisma.TableSalaryWhereUniqueInput, tokenPayload: TokenPayload) {
  //   return this.prisma.tableSalary.findUniqueOrThrow({
  //     where: {
  //       id: where.id,
  //       isPublic: true,
  //       branchId: tokenPayload.branchId,
  //     },
  //     include: {
  //       detailTableSalaries: {
  //         select: {
  //           employee: {
  //             select: {
  //               id: true,
  //               name: true,
  //               code: true,
  //               phone: true,
  //               photoURL: true,
  //             },
  //           },
  //           allowanceValue: true,
  //           deductionValue: true,
  //           totalHours: true,
  //           baseSalary: true,
  //           workDay: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async update(
  //   params: {
  //     where: Prisma.TableSalaryWhereUniqueInput;
  //     data: UpdateTableSalaryDto;
  //   },
  //   tokenPayload: TokenPayload,
  // ) {
  //   const { where, data } = params;

  //   const ids = await this.filterTableSalaryConfirmByIds([where.id]);

  //   if (ids.length > 0)
  //     throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Bảng lương đã được xác nhận không thể cập nhật!");

  //   return await this.prisma.$transaction(async (prisma) => {
  //     const tableSalary = await prisma.tableSalary.update({
  //       where: { id: where.id, isPublic: true, branchId: tokenPayload.branchId },
  //       data: {
  //         name: data.name,
  //         description: data.description,
  //         updatedBy: tokenPayload.accountId,
  //       },
  //     });

  //     await Promise.all(
  //       data.detailTableSalaries.map(async (detail) => {
  //         const allowanceLabel = tableSalary.allowanceLabel;
  //         const deductionLabel = tableSalary.deductionLabel;
  //         const allowanceValue = detail.allowanceValue?.map((dto) => ({
  //           id: dto.id,
  //           value: dto.value,
  //         }));
  //         const deductionValue = detail.deductionValue?.map((dto) => ({
  //           id: dto.id,
  //           value: dto.value,
  //         }));

  //         if (Array.isArray(allowanceLabel) && Array.isArray(deductionLabel)) {
  //           if (allowanceLabel.length !== allowanceValue.length || deductionLabel.length !== deductionValue.length)
  //             throw new CustomHttpException(HttpStatus.CONFLICT, "Phụ cấp khoản trừ không hợp lệ!");
  //         }

  //         await prisma.detailTableSalary.update({
  //           where: {
  //             tableSalaryId_employeeId: {
  //               employeeId: detail.employeeId,
  //               tableSalaryId: where.id,
  //             },
  //           },
  //           data: {
  //             totalHours: detail.totalHours,
  //             baseSalary: detail.baseSalary,
  //             workDay: detail.workDay,
  //             allowanceValue: allowanceValue,
  //             deductionValue: deductionValue,
  //           },
  //         });
  //       }),
  //     );

  //     await this.commonService.createActivityLog(
  //       [tableSalary.id],
  //       "TableSalary",
  //       ACTIVITY_LOG_TYPE.UPDATE,
  //       tokenPayload,
  //     );

  //     return tableSalary;
  //   });
  // }

  // async confirm(
  //   params: {
  //     where: Prisma.TableSalaryWhereUniqueInput;
  //   },
  //   tokenPayload: TokenPayload,
  // ) {
  //   const { where } = params;

  //   const ids = await this.filterTableSalaryConfirmByIds([where.id]);

  //   if (ids.length > 0)
  //     throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Bảng lương đã được xác nhận không thể cập nhật!");

  //   const result = await this.prisma.tableSalary.update({
  //     where: { id: where.id, isPublic: true },
  //     data: {
  //       isConfirm: true,
  //       confirmBy: tokenPayload.accountId,
  //       updatedBy: tokenPayload.accountId,
  //     },
  //   });

  //   await this.commonService.createActivityLog([result.id], "TableSalary", ACTIVITY_LOG_TYPE.CONFIRM, tokenPayload);

  //   return result;
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const notValidIds = await this.filterTableSalaryConfirmByIds(data.ids);
  //   const validIds = data.ids.filter((id) => !notValidIds.includes(id));

  //   const count = await this.prisma.tableSalary.updateMany({
  //     where: {
  //       id: {
  //         in: validIds,
  //       },
  //       isPublic: true,
  //       branchId: tokenPayload.branchId,
  //     },
  //     data: {
  //       isPublic: false,
  //       updatedBy: tokenPayload.accountId,
  //     },
  //   });

  //   await this.commonService.createActivityLog(validIds, "TableSalary", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

  //   return { ...count, ids: validIds, notValidIds } as DeleteManyResponse;
  // }

  // async filterTableSalaryConfirmByIds(ids: string[]) {
  //   const tableSalaries = await this.prisma.tableSalary.findMany({
  //     where: {
  //       id: { in: ids },
  //       isConfirm: true,
  //     },
  //     select: { id: true },
  //   });

  //   return tableSalaries.map((tableSalary) => tableSalary.id);
  // }
}
