import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateOrderRatingDto,
  UpdateOrderRatingDto
} from './dto/order-rating.dto'
import {
  DeleteManyResponse,
  TokenCustomerPayload
} from 'interfaces/common.interface'
import { Prisma } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { FindManyOrderRatings } from './dto/find-many-order-rating'
import { customPaginate } from 'utils/Helps'

@Injectable()
export class OrderRatingService {
  constructor(private readonly prisma: PrismaService) {}

  // async create(data: CreateOrderRatingDto, tokenPayload: TokenCustomerPayload) {
  //   await this.prisma.order.findFirstOrThrow({
  //     where: {
  //       id: data.orderId,
  //       customerId: tokenPayload.customerId
  //     }
  //   })

  //   return await this.prisma.orderRating.create({
  //     data: {
  //       ratingValue: data.ratingValue,
  //       comment: data.comment,
  //       photoURLs: data.photoURLs,
  //       order: {
  //         connect: {
  //           id: data.orderId
  //         }
  //       }
  //     }
  //   })
  // }

  // async update(
  //   params: {
  //     data: UpdateOrderRatingDto
  //     where: Prisma.OrderRatingWhereUniqueInput
  //   },
  //   tokenPayload: TokenCustomerPayload
  // ) {
  //   const { data, where } = params

  //   return await this.prisma.orderRating.update({
  //     where: {
  //       id: where.id,
  //       order: {
  //         customer: {
  //           id: tokenPayload.customerId
  //         }
  //       }
  //     },
  //     data: {
  //       ratingValue: data.ratingValue,
  //       comment: data.comment,
  //       photoURLs: data.photoURLs
  //     }
  //   })
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenCustomerPayload) {
  //   const count = await this.prisma.orderRating.updateMany({
  //     where: {
  //       id: {
  //         in: data.ids
  //       },
  //       order: {
  //         customer: {
  //           id: tokenPayload.customerId
  //         }
  //       },
  //       isPublic: true
  //     },
  //     data: {
  //       isPublic: false
  //     }
  //   })

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }

  // async findAll(
  //   params: FindManyOrderRatings,
  //   tokenPayload: TokenCustomerPayload
  // ) {
  //   const { page, perPage, orderId, orderBy } = params

  //   const where: Prisma.OrderRatingWhereInput = {
  //     isPublic: true,
  //     order: {
  //       id: orderId,
  //       isPublic: true
  //     }
  //   }

  //   return await customPaginate(
  //     this.prisma.productOptionGroup,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }
}
