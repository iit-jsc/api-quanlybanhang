import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService
  ) {}

  // async create(data: CreateCustomerDto, tokenPayload: TokenPayload) {
  //   const customer = await this.prisma.customer.create({
  //     data: {
  //       name: data.name,
  //       endow: data.endow,
  //       phone: data.phone,
  //       isOrganize: data.isOrganize,
  //       address: data.address,
  //       birthday: data.birthday,
  //       ...(data.customerTypeId && {
  //         customerType: {
  //           connect: {
  //             id: data.customerTypeId
  //           }
  //         }
  //       }),
  //       description: data.description,
  //       discount: data.discount,
  //       discountType: data.discountType,
  //       email: data.email,
  //       fax: data.fax,
  //       tax: data.tax,
  //       sex: data.sex,
  //       representativeName: data.representativeName,
  //       representativePhone: data.representativePhone,
  //       shop: {
  //         connect: {
  //           id: tokenPayload.shopId,
  //           isPublic: true
  //         }
  //       },
  //       creator: {
  //         connect: {
  //           id: tokenPayload.accountId
  //         }
  //       }
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     [customer.id],
  //     'Customer',
  //     ACTIVITY_LOG_TYPE.CREATE,
  //     tokenPayload
  //   )

  //   return customer
  // }

  // async findAll(params: FindManyCustomerDto, tokenPayload: TokenPayload) {
  //   const { page, perPage, keyword, customerTypeIds, from, to, orderBy } =
  //     params

  //   const keySearch = ['name', 'email', 'phone']

  //   const where: Prisma.CustomerWhereInput = {
  //     isPublic: true,
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
  //     }),
  //     ...(customerTypeIds?.length > 0 && {
  //       customerType: {
  //         id: { in: customerTypeIds },
  //         isPublic: true,
  //         shopId: tokenPayload.shopId
  //       }
  //     }),
  //     ...(from &&
  //       to && {
  //         createdAt: {
  //           gte: from,
  //           lte: new Date(new Date(to).setHours(23, 59, 59, 999))
  //         }
  //       }),
  //     ...(from &&
  //       !to && {
  //         createdAt: {
  //           gte: from
  //         }
  //       }),
  //     ...(!from &&
  //       to && {
  //         createdAt: {
  //           lte: new Date(new Date(to).setHours(23, 59, 59, 999))
  //         }
  //       }),
  //     shop: {
  //       id: tokenPayload.shopId,
  //       isPublic: true
  //     }
  //   }

  //   return await customPaginate(
  //     this.prisma.customer,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       select: {
  //         id: true,
  //         name: true,
  //         endow: true,
  //         phone: true,
  //         address: true,
  //         isOrganize: true,
  //         birthday: true,
  //         customerType: {
  //           select: {
  //             id: true,
  //             name: true,
  //             description: true,
  //             discount: true,
  //             discountType: true
  //           }
  //         },
  //         description: true,
  //         discount: true,
  //         discountType: true,
  //         email: true,
  //         fax: true,
  //         tax: true,
  //         sex: true,
  //         representativeName: true,
  //         representativePhone: true,
  //         createdAt: true,
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
  //   where: Prisma.CustomerWhereUniqueInput,
  //   tokenPayload: TokenPayload
  // ) {
  //   return this.prisma.customer.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       shop: {
  //         id: tokenPayload.shopId,
  //         isPublic: true
  //       }
  //     },
  //     include: {
  //       customerType: {
  //         select: {
  //           id: true,
  //           name: true,
  //           description: true,
  //           discount: true,
  //           discountType: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async update(
  //   params: {
  //     where: Prisma.CustomerWhereUniqueInput
  //     data: UpdateCustomerDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params

  //   const customer = await this.prisma.customer.update({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       shop: {
  //         id: tokenPayload.shopId,
  //         isPublic: true
  //       }
  //     },
  //     data: {
  //       name: data.name,
  //       endow: data.endow,
  //       isOrganize: data.isOrganize,
  //       phone: data.phone,
  //       address: data.address,
  //       birthday: data.birthday,
  //       description: data.description,
  //       discount: data.discount,
  //       discountType: data.discountType,
  //       email: data.email,
  //       fax: data.fax,
  //       tax: data.tax,
  //       sex: data.sex,
  //       representativeName: data.representativeName,
  //       representativePhone: data.representativePhone,
  //       ...(data.customerTypeId && {
  //         customerType: {
  //           connect: {
  //             id: data.customerTypeId
  //           }
  //         }
  //       }),
  //       updater: {
  //         connect: {
  //           id: tokenPayload.accountId
  //         }
  //       }
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     [customer.id],
  //     'Customer',
  //     ACTIVITY_LOG_TYPE.UPDATE,
  //     tokenPayload
  //   )

  //   return customer
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.customer.updateMany({
  //     where: {
  //       id: {
  //         in: data.ids
  //       },
  //       isPublic: true,
  //       shop: {
  //         id: tokenPayload.shopId,
  //         isPublic: true
  //       }
  //     },
  //     data: {
  //       isPublic: false,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     data.ids,
  //     'Customer',
  //     ACTIVITY_LOG_TYPE.DELETE,
  //     tokenPayload
  //   )

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }

  // async checkEmailExisted(data: CheckEmailDto) {}
}
