import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DeleteManyResponse, TokenPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import {
  CreateCustomerTypeDto,
  UpdateCustomerTypeDto
} from './dto/create-customer-type'
import { CommonService } from 'src/common/common.service'
import { ACTIVITY_LOG_TYPE } from 'enums/common.enum'

@Injectable()
export class CustomerTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService
  ) {}

  // async create(data: CreateCustomerTypeDto, tokenPayload: TokenPayload) {
  //   const customerType = await this.prisma.customerType.create({
  //     data: {
  //       name: data.name,
  //       description: data.description,
  //       discountType: data.discountType,
  //       discount: data.discount,
  //       shop: {
  //         connect: {
  //           id: tokenPayload.shopId
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
  //     [customerType.id],
  //     'CustomerType',
  //     ACTIVITY_LOG_TYPE.CREATE,
  //     tokenPayload
  //   )

  //   return customerType
  // }

  // async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
  //   let { page, perPage, keyword, orderBy } = params
  //   let where: Prisma.CustomerTypeWhereInput = {
  //     isPublic: true,
  //     ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
  //     shop: {
  //       id: tokenPayload.shopId,
  //       isPublic: true
  //     }
  //   }

  //   return await customPaginate(
  //     this.prisma.customerType,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       select: {
  //         id: true,
  //         name: true,
  //         description: true,
  //         discount: true,
  //         discountType: true,
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
  //   where: Prisma.CustomerTypeWhereUniqueInput,
  //   tokenPayload: TokenPayload
  // ) {
  //   return this.prisma.customerType.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       shop: {
  //         id: tokenPayload.shopId,
  //         isPublic: true
  //       }
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       description: true,
  //       discount: true,
  //       discountType: true
  //     }
  //   })
  // }

  // async update(
  //   params: {
  //     where: Prisma.CustomerTypeWhereUniqueInput
  //     data: UpdateCustomerTypeDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params
  //   const customerType = await this.prisma.customerType.update({
  //     where: {
  //       id: where.id,
  //       isPublic: true,
  //       shop: {
  //         id: tokenPayload.shopId,
  //         isPublic: true
  //       }
  //     },
  //     data: {
  //       name: data.name,
  //       description: data.description,
  //       discountType: data.discountType,
  //       discount: data.discount,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     [customerType.id],
  //     'CustomerType',
  //     ACTIVITY_LOG_TYPE.UPDATE,
  //     tokenPayload
  //   )

  //   return customerType
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.customerType.updateMany({
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
  //     'CustomerType',
  //     ACTIVITY_LOG_TYPE.DELETE,
  //     tokenPayload
  //   )

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }
}
