import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  // async reportCustomer(params: ReportCustomerDto, tokenPayload: TokenPayload) {
  //   const { from, to } = params

  //   const where: Prisma.CustomerWhereInput = {
  //     isPublic: true,
  //     shopId: tokenPayload.shopId,
  //     ...(from &&
  //       to && {
  //         createdAt: {
  //           gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
  //           lte: new Date(new Date(to).setHours(23, 59, 59, 999))
  //         }
  //       }),
  //     ...(from &&
  //       !to && {
  //         createdAt: {
  //           gte: new Date(new Date(from).setHours(0, 0, 0, 0))
  //         }
  //       }),
  //     ...(!from &&
  //       to && {
  //         createdAt: {
  //           lte: new Date(new Date(to).setHours(23, 59, 59, 999))
  //         }
  //       })
  //   }

  //   return this.prisma.customer.count({
  //     where
  //   })
  // }

  // async reportProduct(params: ReportProductDto, tokenPayload: TokenPayload) {
  //   const where: Prisma.ProductTypeWhereInput = {
  //     isPublic: true,
  //     branchId: tokenPayload.branchId
  //   }

  //   return this.prisma.productType.findMany({
  //     where,
  //     select: {
  //       id: true,
  //       name: true,
  //       description: true,
  //       _count: {
  //         select: {
  //           products: {
  //             where: {
  //               isPublic: true
  //             }
  //           }
  //         }
  //       }
  //     }
  //   })
  // }

  // async reportWarehouse(
  //   params: ReportWareHouseDto,
  //   tokenPayload: TokenPayload
  // ) {
  //   const where: Prisma.WarehouseWhereInput = {
  //     isPublic: true,
  //     branchId: tokenPayload.branchId
  //   }

  //   return this.prisma.warehouse.findMany({
  //     where,
  //     select: {
  //       id: true,
  //       name: true,
  //       photoURLs: true,
  //       stocks: {
  //         select: {
  //           productId: true,
  //           quantity: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async reportEmployee(params: ReportEmployeeDto, tokenPayload: TokenPayload) {
  //   const where: Prisma.UserWhereInput = {
  //     isPublic: true,
  //     branchId: tokenPayload.branchId,
  //     account: {
  //       type: ACCOUNT_TYPE.STAFF
  //     }
  //   }

  //   return this.prisma.user.count({
  //     where
  //   })
  // }
}
