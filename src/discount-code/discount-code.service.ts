import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class DiscountCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService
  ) {}

  // async create(data: CreateDiscountCodeDto, tokenPayload: TokenPayload) {
  //   const discountCodeData = []

  //   await this.checkAmountValid(data.amount, data.discountIssueId)

  //   for (let i = 0; i < data.amount; i++) {
  //     discountCodeData.push({
  //       code: `${data.prefix || ''}${generateSortCode()}${data.suffixes || ''}`,
  //       branchId: tokenPayload.branchId,
  //       discountIssueId: data.discountIssueId,
  //       createdBy: tokenPayload.accountId
  //     })
  //   }

  //   const discountCodes = await this.prisma.discountCode.createMany({
  //     data: discountCodeData
  //   })

  //   await this.commonService.createActivityLog(
  //     [data.discountIssueId],
  //     'DiscountCode',
  //     ACTIVITY_LOG_TYPE.CREATE,
  //     tokenPayload
  //   )

  //   return discountCodes
  // }

  // async checkAmountValid(amount: number, discountIssueId: string) {
  //   const discountIssue = await this.prisma.discountIssue.findUnique({
  //     where: { id: discountIssueId, isPublic: true }
  //   })

  //   const currentAmount = await this.prisma.discountCode.count({
  //     where: { isPublic: true, discountIssueId }
  //   })

  //   if (discountIssue.isLimit && amount + currentAmount > discountIssue.amount)
  //     throw new CustomHttpException(
  //       HttpStatus.CONFLICT,
  //       'Số lượng vượt quá đợt khuyến mãi!',
  //       [],
  //       {
  //         currentAmount,
  //         maxAmount: discountIssue.amount
  //       }
  //     )
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.discountCode.updateMany({
  //     where: {
  //       id: {
  //         in: data.ids
  //       },
  //       isPublic: true,
  //       branchId: tokenPayload.branchId
  //     },
  //     data: {
  //       isPublic: false,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     data.ids,
  //     'DiscountCode',
  //     ACTIVITY_LOG_TYPE.DELETE,
  //     tokenPayload
  //   )

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }

  // async findAll(params: FindManyDiscountCodeDto, tokenPayload: TokenPayload) {
  //   let { page, perPage, keyword, orderBy, isUsed, discountIssueIds } = params
  //   let where: Prisma.DiscountCodeWhereInput = {
  //     isPublic: true,
  //     branchId: tokenPayload.branchId,
  //     ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
  //     ...(isUsed !== undefined && { isUsed }),
  //     ...(discountIssueIds?.length > 0 && {
  //       discountIssue: {
  //         id: { in: discountIssueIds },
  //         isPublic: true
  //       }
  //     })
  //   }

  //   return await customPaginate(
  //     this.prisma.discountCode,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       include: {
  //         discountIssue: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // async findUniq(
  //   where: Prisma.DiscountCodeWhereUniqueInput,
  //   tokenPayload: TokenPayload
  // ) {
  //   return this.prisma.discountCode.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       branchId: tokenPayload.branchId
  //     },
  //     include: {
  //       discountIssue: true
  //     }
  //   })
  // }

  // async checkAvailable(data: CheckAvailableDto) {
  //   return await this.prisma.discountCode.findUniqueOrThrow({
  //     where: {
  //       branchId_code: {
  //         branchId: data.branchId,
  //         code: data.code
  //       },
  //       isPublic: true,
  //       isUsed: false,
  //       discountIssue: {
  //         startDate: {
  //           lte: new Date(new Date().setHours(23, 59, 59, 999))
  //         },
  //         isPublic: true,
  //         minTotalOrder: {
  //           lte: data.totalOrder
  //         },
  //         AND: [
  //           {
  //             OR: [
  //               {
  //                 endDate: {
  //                   gte: new Date(new Date().setHours(0, 0, 0, 0))
  //                 }
  //               },
  //               {
  //                 isEndDateDisabled: true
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   })
  // }
}
