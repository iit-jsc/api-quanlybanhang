import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class CompensationSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService
  ) {}

  // async create(data: CreateCompensationSettingDto, tokenPayload: TokenPayload) {
  //   const employeeIds = await this.commonService.findAllIdsInBranch(
  //     'User',
  //     tokenPayload.branchId,
  //     {
  //       account: {
  //         type: ACCOUNT_TYPE.STAFF
  //       },
  //       employeeSalary: {
  //         ...(data.applyTo !== COMPENSATION_APPLY_TO.ALL && {
  //           isFulltime:
  //             data.applyTo === COMPENSATION_APPLY_TO.FULLTIME ? true : false
  //         })
  //       }
  //     }
  //   )

  //   return await this.prisma.$transaction(async prisma => {
  //     const compensationSetting = await this.prisma.compensationSetting.create({
  //       data: {
  //         name: data.name,
  //         description: data.description,
  //         defaultValue: data.defaultValue,
  //         type: data.type,
  //         applyTo: data.applyTo,
  //         branchId: tokenPayload.branchId,
  //         createdBy: tokenPayload.accountId
  //       }
  //     })

  //     const compensationEmployeeData = employeeIds.map(
  //       (employeeId: string) => ({
  //         employeeId,
  //         compensationSettingId: compensationSetting.id,
  //         type: data.type,
  //         value: data.defaultValue,
  //         createdBy: tokenPayload.accountId,
  //         branchId: tokenPayload.branchId
  //       })
  //     ) as Prisma.CompensationEmployeeCreateManyInput[]

  //     await prisma.compensationEmployee.createMany({
  //       data: compensationEmployeeData,
  //       skipDuplicates: true
  //     })

  //     await this.commonService.createActivityLog(
  //       [compensationSetting.id],
  //       'CompensationSetting',
  //       ACTIVITY_LOG_TYPE.CREATE,
  //       tokenPayload
  //     )

  //     return compensationSetting
  //   })
  // }

  // async findAll(
  //   params: FindManyCompensationSettingDto,
  //   tokenPayload: TokenPayload
  // ) {
  //   const { page, perPage, keyword, types, applyTos, orderBy } = params

  //   const keySearch = ['name']

  //   const where: Prisma.CompensationSettingWhereInput = {
  //     isPublic: true,
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
  //     }),
  //     ...(types && { type: { in: types } }),
  //     ...(applyTos && { applyTo: { in: applyTos } }),
  //     branchId: tokenPayload.branchId
  //   }

  //   return await customPaginate(
  //     this.prisma.compensationSetting,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       select: {
  //         id: true,
  //         name: true,
  //         description: true,
  //         type: true,
  //         applyTo: true,
  //         updatedAt: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // async findUniq(
  //   where: Prisma.CompensationSettingWhereUniqueInput,
  //   tokenPayload: TokenPayload
  // ) {
  //   return this.prisma.compensationSetting.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       branchId: tokenPayload.branchId
  //     }
  //   })
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   return await this.prisma.$transaction(async prisma => {
  //     await prisma.compensationEmployee.deleteMany({
  //       where: {
  //         branchId: tokenPayload.branchId,
  //         compensationSettingId: {
  //           in: data.ids
  //         }
  //       }
  //     })

  //     const count = await prisma.compensationSetting.updateMany({
  //       where: {
  //         id: {
  //           in: data.ids
  //         },
  //         isPublic: true,
  //         branchId: tokenPayload.branchId
  //       },
  //       data: {
  //         isPublic: false,
  //         updatedBy: tokenPayload.accountId
  //       }
  //     })

  //     await this.commonService.createActivityLog(
  //       data.ids,
  //       'CompensationSetting',
  //       ACTIVITY_LOG_TYPE.DELETE,
  //       tokenPayload
  //     )

  //     return { ...count, ids: data.ids } as DeleteManyResponse
  //   })
  // }
}
