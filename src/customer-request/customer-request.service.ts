import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CustomerRequestGateway } from 'src/gateway/customer-request.gateway'

@Injectable()
export class CustomerRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerRequestGateway: CustomerRequestGateway
  ) {}

  // async create(data: CreateCustomerRequestDto) {
  //   const customerRequest = await this.prisma.customerRequest.create({
  //     data: {
  //       content: data.content,
  //       tableId: data.tableId,
  //       branchId: data.branchId,
  //       requestType: data.requestType,
  //       status: REQUEST_STATUS.PENDING
  //     },
  //     include: {
  //       table: true
  //     }
  //   })

  //   // Gửi socket
  //   await this.customerRequestGateway.handleCreateCustomerRequest(
  //     customerRequest
  //   )

  //   return customerRequest
  // }

  // async update(
  //   params: {
  //     data: UpdateCustomerRequestDto
  //     where: Prisma.CustomerRequestWhereUniqueInput
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { data, where } = params

  //   return this.prisma.customerRequest.update({
  //     data: {
  //       content: data.content,
  //       tableId: data.tableId,
  //       requestType: data.requestType,
  //       status: data.status,
  //       updatedBy: tokenPayload.accountId
  //     },
  //     where: {
  //       id: where.id,
  //       branchId: tokenPayload.branchId
  //     }
  //   })
  // }

  // async findAll(params: FindManyCustomerRequestDto) {
  //   let {
  //     page,
  //     perPage,
  //     orderBy,
  //     keyword,
  //     branchId,
  //     tableIds,
  //     requestTypes,
  //     statuses
  //   } = params

  //   const keySearch = ['content']

  //   let where: Prisma.CustomerRequestWhereInput = {
  //     isPublic: true,
  //     branchId: branchId,
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
  //     }),
  //     ...(tableIds && {
  //       table: {
  //         id: { in: tableIds },
  //         isPublic: true
  //       }
  //     }),
  //     ...(requestTypes && {
  //       requestType: {
  //         in: requestTypes
  //       }
  //     }),
  //     ...(statuses && {
  //       status: {
  //         in: statuses
  //       }
  //     })
  //   }

  //   return await customPaginate(
  //     this.prisma.customerRequest,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       include: {
  //         updater: {
  //           select: {
  //             id: true,
  //             username: true,
  //             user: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 photoURL: true,
  //                 phone: true
  //               }
  //             }
  //           }
  //         },
  //         table: {
  //           select: {
  //             area: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 updatedAt: true
  //               }
  //             },
  //             id: true,
  //             name: true,
  //             seat: true,
  //             updatedAt: true
  //           }
  //         }
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // async findUniq(
  //   where: Prisma.CustomerRequestWhereUniqueInput,
  //   tokenPayload: TokenPayload
  // ) {
  //   return this.prisma.customerRequest.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       branchId: tokenPayload.branchId
  //     },
  //     include: {
  //       updater: {
  //         select: {
  //           id: true,
  //           username: true,
  //           user: {
  //             select: {
  //               id: true,
  //               name: true,
  //               photoURL: true,
  //               phone: true
  //             }
  //           }
  //         }
  //       },
  //       table: {
  //         select: {
  //           area: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.customerRequest.updateMany({
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

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }
}
