import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CommonService } from 'src/common/common.service'

import { OrderGateway } from 'src/gateway/order.gateway'
import { TableGateway } from 'src/gateway/table.gateway'
import { PointAccumulationService } from 'src/point-accumulation/point-accumulation.service'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
    private mailService: MailService,
    private readonly orderGateway: OrderGateway,
    private readonly tableGateway: TableGateway,
    private readonly pointAccumulationService: PointAccumulationService
  ) {}

  // async getOrderDetails(
  //   orderProducts: OrderProducts[],
  //   status?: number,
  //   tokenPayload?: TokenPayload
  // ) {
  //   return await Promise.all(
  //     orderProducts.map(async item => {
  //       const [product, productOptions] = await Promise.all([
  //         this.prisma.product.findUniqueOrThrow({
  //           where: { id: item.productId },
  //           select: {
  //             id: true,
  //             branchId: true,
  //             unitId: true,
  //             name: true,
  //             slug: true,
  //             code: true,
  //             price: true,
  //             oldPrice: true,
  //             productTypeId: true,
  //             thumbnail: true,
  //             otherAttributes: true
  //           }
  //         }),
  //         this.prisma.productOption.findMany({
  //           where: {
  //             id: {
  //               in: item.productOptionIds || []
  //             },
  //             isPublic: true
  //           },
  //           select: {
  //             id: true,
  //             name: true,
  //             price: true,
  //             photoURL: true,
  //             productOptionGroupId: true,
  //             branchId: true
  //           }
  //         })
  //       ])

  //       return {
  //         amount: item.amount,
  //         status,
  //         product: product,
  //         note: item.note,
  //         productOptions: productOptions,
  //         branchId: tokenPayload.branchId,
  //         createdBy: tokenPayload.accountId,
  //         updatedBy: tokenPayload.accountId
  //       }
  //     })
  //   )
  // }

  // getTotalInOrder(orderDetails: AnyObject) {
  //   return orderDetails.reduce((total, order) => {
  //     const productPrice = order.product?.price || 0

  //     const optionsTotal = (order.productOptions || []).reduce(
  //       (sum, option) => sum + (option.price || 0),
  //       0
  //     )

  //     return total + order.amount * (productPrice + optionsTotal)
  //   }, 0)
  // }

  // async getPromotion(
  //   promotionId: string,
  //   orderDetails: OrderProductDto[],
  //   branchId: string,
  //   prisma?: PrismaClient
  // ) {
  //   prisma = prisma || this.prisma

  //   const matchPromotion = await prisma.promotion.findUnique({
  //     where: {
  //       id: promotionId,

  //       branchId: branchId,
  //       startDate: {
  //         lte: new Date(new Date().setHours(23, 59, 59, 999))
  //       },
  //       isActive: true,
  //       AND: [
  //         {
  //           OR: [
  //             {
  //               promotionConditions: {
  //                 some: {
  //                   OR: orderDetails.map(order => ({
  //                     productId: order.productId,
  //                     amount: {
  //                       lte: order.amount
  //                     }
  //                   }))
  //                 }
  //               }
  //             },
  //             {
  //               promotionConditions: {
  //                 none: {}
  //               }
  //             }
  //           ]
  //         },
  //         {
  //           OR: [
  //             {
  //               endDate: {
  //                 gte: new Date(new Date().setHours(0, 0, 0, 0))
  //               }
  //             },
  //             {
  //               isEndDateDisabled: true
  //             }
  //           ]
  //         },
  //         {
  //           isActive: true
  //         }
  //       ]
  //     },
  //     select: {
  //       id: true,
  //       type: true,
  //       discount: true,
  //       discountType: true,
  //       isActive: true,
  //       amount: true,
  //       amountApplied: true,
  //       code: true,
  //       maxValue: true,
  //       name: true,
  //       isEndDateDisabled: true,
  //       description: true,
  //       startDate: true,
  //       endDate: true,
  //       updatedAt: true,
  //       promotionProducts: {
  //         where: {
  //           isPublic: true
  //         },
  //         select: {
  //           id: true,
  //           name: true,
  //           amount: true,
  //           photoURL: true
  //         }
  //       }
  //     }
  //   })

  //   if (!matchPromotion)
  //     throw new CustomHttpException(
  //       HttpStatus.NOT_FOUND,
  //       'Không tìm thấy khuyến mãi!'
  //     )

  //   if (matchPromotion.amountApplied >= matchPromotion.amount)
  //     throw new CustomHttpException(
  //       HttpStatus.CONFLICT,
  //       'Đã quá số lượng áp dụng!'
  //     )

  //   await prisma.promotion.update({
  //     where: { id: promotionId },
  //     data: {
  //       amountApplied: {
  //         increment: 1
  //       }
  //     }
  //   })

  //   return matchPromotion
  // }

  // async getDiscountCode(
  //   code: string,
  //   totalOrder: number,
  //   branchId: string,
  //   prisma: PrismaClient
  // ) {
  //   const discountCode = await this.prisma.discountCode.findUniqueOrThrow({
  //     where: {
  //       branchId_code: {
  //         branchId: branchId,
  //         code: code
  //       },
  //       isUsed: false,
  //       discountIssue: {
  //         startDate: {
  //           lte: new Date(new Date().setHours(23, 59, 59, 999))
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
  //     },
  //     select: {
  //       id: true,
  //       code: true,
  //       isUsed: true,
  //       createdAt: true,
  //       updatedAt: true,
  //       discountIssue: {
  //         select: {
  //           id: true,
  //           name: true,
  //           code: true,
  //           amount: true,
  //           startDate: true,
  //           endDate: true,
  //           isEndDateDisabled: true,
  //           maxValue: true,
  //           discountType: true,
  //           discount: true,
  //           minTotalOrder: true,
  //           description: true,
  //           updatedAt: true
  //         }
  //       }
  //     }
  //   })

  //   if (discountCode.discountIssue.minTotalOrder > totalOrder)
  //     throw new CustomHttpException(
  //       HttpStatus.CONFLICT,
  //       'Tổng số tiền đơn hàng chưa đủ để áp dụng!'
  //     )

  //   await prisma.discountCode.update({
  //     where: {
  //       branchId_code: {
  //         branchId: branchId,
  //         code: code
  //       }
  //     },
  //     data: { isUsed: true }
  //   })

  //   if (!discountCode)
  //     throw new CustomHttpException(
  //       HttpStatus.NOT_FOUND,
  //       'Mã giảm giá không tồn tại hoặc đã sử dụng!'
  //     )

  //   return discountCode
  // }

  // async create(data: CreateOrderDto, tokenPayload: TokenPayload) {
  //   const orderDetails = await this.getOrderDetails(
  //     data.orderProducts,
  //     DETAIL_ORDER_STATUS.APPROVED,
  //     tokenPayload
  //   )

  //   return await this.prisma.$transaction(async (prisma: PrismaClient) => {
  //     const order = await prisma.order.create({
  //       data: {
  //         note: data.note,
  //         orderType: data.orderType,
  //         orderStatus: data.orderStatus || ORDER_STATUS_COMMON.APPROVED,
  //         code: data.code || generateSortCode(),
  //         ...(data.customerId && {
  //           customer: {
  //             connect: {
  //               id: data.customerId
  //             }
  //           }
  //         }),
  //         orderDetails: {
  //           createMany: {
  //             data: orderDetails
  //           }
  //         },
  //         branch: {
  //           connect: {
  //             id: tokenPayload.branchId,
  //             isPublic: true
  //           }
  //         },
  //         creator: {
  //           connect: {
  //             id: tokenPayload.accountId,
  //             isPublic: true
  //           }
  //         }
  //       },
  //       include: {
  //         orderDetails: {
  //           select: {
  //             id: true,
  //             amount: true,
  //             note: true,
  //             product: true,
  //             productOptions: true
  //           }
  //         }
  //       }
  //     })

  //     // Gửi socket
  //     await this.orderGateway.handleModifyOrder(order)

  //     await this.commonService.createActivityLog(
  //       [order.id],
  //       'Order',
  //       ACTIVITY_LOG_TYPE.CREATE,
  //       tokenPayload
  //     )

  //     return order
  //   })
  // }

  // async createOrderToTableByEmployee(
  //   data: CreateOrderToTableDto,
  //   tokenPayload: TokenPayload
  // ) {
  //   const orderDetails = await this.getOrderDetails(
  //     data.orderProducts,
  //     DETAIL_ORDER_STATUS.APPROVED,
  //     tokenPayload
  //   )

  //   const table = await this.prisma.table.update({
  //     where: { id: data.tableId },
  //     data: {
  //       orderDetails: {
  //         createMany: {
  //           data: orderDetails
  //         }
  //       },
  //       updatedBy: tokenPayload.accountId
  //     },
  //     include: {
  //       orderDetails: true
  //     }
  //   })

  //   // Bắn socket cho các người dùng
  //   await this.tableGateway.handleModifyTable(table)

  //   await this.commonService.createActivityLog(
  //     [table.id],
  //     'Table',
  //     ACTIVITY_LOG_TYPE.CREATE_TO_TABLE,
  //     tokenPayload
  //   )

  //   return table
  // }

  // async createOrderToTableByCustomer(data: CreateOrderToTableByCustomerDto) {
  //   const orderDetails = await this.getOrderDetails(
  //     data.orderProducts,
  //     DETAIL_ORDER_STATUS.WAITING,
  //     {
  //       branchId: data.branchId
  //     }
  //   )

  //   const table = await this.prisma.table.update({
  //     where: { id: data.tableId },
  //     data: {
  //       orderDetails: {
  //         createMany: {
  //           data: orderDetails
  //         }
  //       }
  //     },
  //     include: {
  //       orderDetails: true
  //     }
  //   })

  //   // Bắn socket cho các người dùng

  //   await this.tableGateway.handleModifyTable(table)

  //   return table
  // }

  // async createOrderOnline(data: CreateOrderOnlineDto) {
  //   const orderDetails = await this.getOrderDetails(
  //     data.orderProducts,
  //     DETAIL_ORDER_STATUS.SUCCESS,
  //     { branchId: data.branchId }
  //   )

  //   const shop = await this.prisma.shop.findFirst({
  //     where: {
  //       branches: {
  //         some: {
  //           id: data.branchId
  //         }
  //       }
  //     }
  //   })

  //   return await this.prisma.$transaction(async (prisma: PrismaClient) => {
  //     const totalOrder = this.getTotalInOrder(orderDetails)
  //     const aggregateOrderProducts = this.commonService.aggregateOrderProducts(
  //       data.orderProducts
  //     )

  //     const [promotionPromise, discountCodePromise] = await Promise.all([
  //       data.promotionId
  //         ? this.getPromotion(
  //             data.promotionId,
  //             aggregateOrderProducts,
  //             data.branchId,
  //             prisma
  //           )
  //         : undefined,
  //       data.discountCode
  //         ? this.getDiscountCode(
  //             data.discountCode,
  //             totalOrder,
  //             data.branchId,
  //             prisma
  //           )
  //         : undefined
  //     ])

  //     const order = await prisma.order.create({
  //       data: {
  //         note: data.note,
  //         orderType: ORDER_TYPE.ONLINE,
  //         orderStatus: ORDER_STATUS_COMMON.WAITING,
  //         discountCode: discountCodePromise,
  //         customerDiscount: {
  //           name: data.name,
  //           phone: data.phone,
  //           email: data.email,
  //           address: data.address
  //         },
  //         promotion: promotionPromise,
  //         code: generateSortCode(),
  //         orderDetails: {
  //           createMany: {
  //             data: orderDetails
  //           }
  //         },
  //         branch: {
  //           connect: {
  //             id: data.branchId,
  //             isPublic: true
  //           }
  //         }
  //       },
  //       include: {
  //         orderDetails: true,
  //         customer: {
  //           include: {
  //             customerType: {
  //               where: {
  //                 isPublic: true
  //               }
  //             }
  //           }
  //         },
  //         branch: {
  //           select: {
  //             id: true,
  //             name: true,
  //             address: true,
  //             phone: true,
  //             shop: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 address: true,
  //                 photoURL: true
  //               }
  //             }
  //           }
  //         }
  //       }
  //     })

  //     // Gửi email
  //     if (data.email) this.mailService.sendEmailOrderSuccess(order)

  //     // Gửi socket
  //     await this.orderGateway.handleModifyOrder(order)

  //     return order
  //   })
  // }

  // async paymentFromTable(
  //   data: PaymentFromTableDto,
  //   tokenPayload: TokenPayload
  // ) {
  //   const newOrder = await this.prisma.$transaction(
  //     async (prisma: PrismaClient) => {
  //       const orderDetails = await this.getOrderDetailsInTable(
  //         data.tableId,
  //         prisma
  //       )
  //       const orderProducts = this.mapOrderProducts(orderDetails)

  //       const totalOrder = this.getTotalInOrder(orderDetails)

  //       const [
  //         promotionPromise,
  //         discountCodePromise,
  //         customerDiscountPromise,
  //         convertedPointValuePromise
  //       ] = await Promise.all([
  //         data.promotionId
  //           ? this.getPromotion(
  //               data.promotionId,
  //               orderProducts,
  //               tokenPayload.branchId,
  //               prisma
  //             )
  //           : undefined,
  //         data.discountCode
  //           ? this.getDiscountCode(
  //               data.discountCode,
  //               totalOrder,
  //               tokenPayload.branchId,
  //               prisma
  //             )
  //           : undefined,
  //         data.customerId
  //           ? this.getCustomerDiscount(data.customerId)
  //           : undefined,
  //         data.exchangePoint
  //           ? this.pointAccumulationService.convertDiscountFromPoint(
  //               data.exchangePoint,
  //               tokenPayload.shopId
  //             )
  //           : undefined,
  //         this.deleteCustomerRequests(data.tableId, tokenPayload, prisma)
  //       ])

  //       const order = await prisma.order.create({
  //         data: {
  //           code: generateSortCode(),
  //           note: data.note,
  //           orderType: ORDER_TYPE.ON_TABLE,
  //           orderStatus: data.orderStatus,
  //           bankingImages: data.bankingImages,
  //           isPaid: true,
  //           usedPoint: data.exchangePoint,
  //           moneyReceived: data.moneyReceived,
  //           paymentAt: new Date(),
  //           convertedPointValue: convertedPointValuePromise ?? 0,
  //           promotion: promotionPromise,
  //           discountCode: discountCodePromise,
  //           customerDiscount: customerDiscountPromise,
  //           ...(data.customerId && {
  //             customer: {
  //               connect: {
  //                 id: data.customerId
  //               }
  //             }
  //           }),
  //           paymentMethod: {
  //             connect: {
  //               id: data.paymentMethodId
  //             }
  //           },
  //           creator: {
  //             connect: {
  //               id: tokenPayload.accountId,
  //               isPublic: true
  //             }
  //           },
  //           branch: {
  //             connect: {
  //               id: tokenPayload.branchId,
  //               isPublic: true
  //             }
  //           }
  //         }
  //       })

  //       await this.passOrderDetailToOrder(
  //         orderDetails,
  //         order.id,
  //         prisma,
  //         tokenPayload
  //       )

  //       await this.deleteTableTransaction(data.tableId, prisma, tokenPayload)

  //       // Xử lý tích điểm
  //       if (data.customerId) {
  //         await this.pointAccumulationService.handlePoint(
  //           data.customerId,
  //           order.id,
  //           data.exchangePoint,
  //           totalOrder,
  //           tokenPayload.shopId,
  //           prisma
  //         )
  //       }

  //       await this.commonService.createActivityLog(
  //         [order.id],
  //         'Order',
  //         ACTIVITY_LOG_TYPE.PAYMENT,
  //         tokenPayload
  //       )

  //       return order
  //     },
  //     {
  //       maxWait: 5000,
  //       timeout: 10000
  //     }
  //   )

  //   return newOrder
  // }

  // async update(
  //   params: {
  //     where: Prisma.OrderWhereUniqueInput
  //     data: UpdateOrderDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params

  //   return await this.prisma.$transaction(async (prisma: PrismaClient) => {
  //     const order = await prisma.order.update({
  //       where: {
  //         id: where.id,
  //         branch: {
  //           id: tokenPayload.branchId,
  //           isPublic: true
  //         }
  //       },
  //       data: {
  //         orderStatus: data.orderStatus,
  //         note: data.note,
  //         bankingImages: data.bankingImages,
  //         ...(data.orderStatus === ORDER_STATUS_COMMON.CANCELLED && {
  //           cancelDate: new Date(),
  //           cancelReason: data.cancelReason
  //         }),
  //         ...(data.paymentMethodId && {
  //           paymentMethod: {
  //             connect: {
  //               id: data.paymentMethodId
  //             }
  //           }
  //         }),
  //         updater: {
  //           connect: {
  //             id: tokenPayload.accountId,
  //             isPublic: true
  //           }
  //         }
  //       },
  //       include: {
  //         orderDetails: {
  //           where: {
  //             isPublic: true
  //           }
  //         }
  //       }
  //     })

  //     await this.commonService.createActivityLog(
  //       [order.id],
  //       'Order',
  //       ACTIVITY_LOG_TYPE.UPDATE,
  //       tokenPayload
  //     )

  //     return order
  //   })
  // }

  // async separateTable(data: SeparateTableDto, tokenPayload: TokenPayload) {
  //   const { fromTableId, toTableId, orderDetailIds } = data

  //   await this.prisma.$transaction(async (prisma: PrismaClient) => {
  //     const response = await prisma.orderDetail.updateMany({
  //       data: {
  //         tableId: toTableId,
  //         updatedBy: tokenPayload.accountId
  //       },
  //       where: {
  //         id: {
  //           in: orderDetailIds
  //         },

  //         table: {
  //           id: fromTableId
  //         }
  //       }
  //     })

  //     if (response.count > 0) {
  //       const moveTransaction = this.createTransaction(
  //         data.fromTableId,
  //         TRANSACTION_TYPE.MOVE,
  //         orderDetailIds,
  //         tokenPayload,
  //         prisma
  //       )

  //       const movedTransaction = this.createTransaction(
  //         data.toTableId,
  //         TRANSACTION_TYPE.MOVED,
  //         orderDetailIds,
  //         tokenPayload,
  //         prisma
  //       )

  //       // delete table transaction nếu table không còn order
  //       const countOrderDetail = await prisma.orderDetail.count({
  //         where: { tableId: data.fromTableId, isPublic: true }
  //       })

  //       if (countOrderDetail == 0)
  //         await this.deleteTableTransaction(
  //           data.fromTableId,
  //           prisma,
  //           tokenPayload
  //         )

  //       await Promise.all([moveTransaction, movedTransaction])
  //     }

  //     return response
  //   })
  // }

  // async createTransaction(
  //   tableId: string,
  //   type: number,
  //   orderDetailIds: string[] | null,
  //   tokenPayload: TokenPayload,
  //   prisma: PrismaClient
  // ) {
  //   return prisma.tableTransaction.create({
  //     data: {
  //       type: type,
  //       branch: {
  //         connect: {
  //           id: tokenPayload.branchId,
  //           isPublic: true
  //         }
  //       },
  //       table: {
  //         connect: {
  //           id: tableId
  //         }
  //       },
  //       ...(orderDetailIds && {
  //         orderDetails: {
  //           connect: orderDetailIds.map(id => ({ id }))
  //         }
  //       }),
  //       creator: {
  //         connect: {
  //           id: tokenPayload.accountId,
  //           isPublic: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async findAll(params: FindManyOrderDto, tokenPayload: TokenPayload) {
  //   const {
  //     page,
  //     perPage,
  //     keyword,
  //     customerId,
  //     from,
  //     to,
  //     orderTypes,
  //     isPaid,
  //     orderBy,
  //     isSave,
  //     orderStatuses
  //   } = params

  //   const keySearch = ['code']

  //   const where: Prisma.OrderWhereInput = {
  //     branchId: tokenPayload.branchId,
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
  //     }),
  //     ...(customerId && {
  //       customerId: customerId
  //     }),
  //     ...(from &&
  //       to && {
  //         createdAt: {
  //           gte: new Date(from),
  //           lte: new Date(to)
  //         }
  //       }),
  //     ...(from &&
  //       !to && {
  //         createdAt: {
  //           gte: new Date(from)
  //         }
  //       }),
  //     ...(!from &&
  //       to && {
  //         createdAt: {
  //           lte: new Date(to)
  //         }
  //       }),
  //     ...(orderTypes?.length > 0 && {
  //       orderType: { in: orderTypes }
  //     }),
  //     ...(orderStatuses?.length > 0 && {
  //       orderStatus: { in: orderStatuses }
  //     }),
  //     ...(typeof isPaid !== 'undefined' && { isPaid: isPaid }),
  //     ...(typeof isSave !== 'undefined' && { isSave: isSave })
  //   }

  //   return await customPaginate(
  //     this.prisma.order,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       select: {
  //         id: true,
  //         code: true,
  //         bankingImages: true,
  //         isPaid: true,
  //         discountCode: true,
  //         isSave: true,
  //         note: true,
  //         orderType: true,
  //         promotion: true,
  //         convertedPointValue: true,
  //         customerDiscount: true,
  //         orderStatus: true,
  //         paymentMethod: {
  //           select: {
  //             id: true,
  //             bankCode: true,
  //             bankName: true,
  //             name: true,
  //             photoURL: true,
  //             representative: true,
  //             type: true,
  //             updatedAt: true
  //           }
  //         },
  //         creator: {
  //           select: {
  //             id: true,
  //             updatedAt: true,
  //             user: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 email: true,
  //                 phone: true,
  //                 photoURL: true,
  //                 updatedAt: true
  //               }
  //             }
  //           }
  //         },
  //         orderDetails: {
  //           where: {
  //             isPublic: true
  //           },
  //           select: {
  //             id: true,
  //             amount: true,
  //             note: true,
  //             status: true,
  //             product: true,
  //             productOptions: true,
  //             updatedAt: true,
  //             createdAt: true
  //           },
  //           orderBy: {
  //             createdAt: 'asc'
  //           }
  //         },
  //         updatedAt: true,
  //         createdAt: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // async findUniq(
  //   where: Prisma.OrderWhereUniqueInput,
  //   tokenPayload: TokenPayload
  // ) {
  //   return this.prisma.order.findFirstOrThrow({
  //     where: {
  //       id: where.id,
  //       branchId: tokenPayload.branchId
  //     },
  //     include: {
  //       paymentMethod: true,
  //       creator: {
  //         select: {
  //           id: true,
  //           user: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //               phone: true,
  //               photoURL: true
  //             }
  //           }
  //         }
  //       },
  //       updater: {
  //         select: {
  //           id: true,
  //           user: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //               phone: true,
  //               photoURL: true
  //             }
  //           }
  //         }
  //       },
  //       orderDetails: {
  //         orderBy: {
  //           createdAt: 'asc'
  //         }
  //       }
  //     }
  //   })
  // }

  // async saveOrder(
  //   params: {
  //     where: Prisma.OrderWhereUniqueInput
  //     data: SaveOrderDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params
  //   return await this.prisma.order.update({
  //     where: {
  //       id: where.id,
  //       branch: { id: tokenPayload.branchId }
  //     },
  //     data: {
  //       isSave: data.isSave,
  //       note: data.note
  //     }
  //   })
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.order.updateMany({
  //     where: {
  //       id: {
  //         in: data.ids
  //       },
  //       branch: { id: tokenPayload.branchId }
  //     },
  //     data: {
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     data.ids,
  //     'Order',
  //     ACTIVITY_LOG_TYPE.DELETE,
  //     tokenPayload
  //   )

  //   return {
  //     ...count,
  //     ids: data.ids
  //   } as DeleteManyResponse
  // }

  // async findAllByCustomer(
  //   params: FindManyOrderDto,
  //   tokenCustomerPayload: TokenCustomerPayload
  // ) {
  //   const { page, perPage, keyword, from, to, orderBy } = params

  //   const keySearch = ['code']

  //   const where: Prisma.OrderWhereInput = {
  //     customerId: tokenCustomerPayload.customerId,
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
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
  //       })
  //   }

  //   return await customPaginate(
  //     this.prisma.order,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       select: {
  //         id: true,
  //         code: true,
  //         bankingImages: true,
  //         isPaid: true,
  //         discountCode: true,
  //         isSave: true,
  //         note: true,
  //         orderType: true,
  //         promotion: true,
  //         convertedPointValue: true,
  //         customerDiscount: true,
  //         orderStatus: true,
  //         paymentMethod: {
  //           select: {
  //             id: true,
  //             bankCode: true,
  //             bankName: true,
  //             name: true,
  //             photoURL: true,
  //             representative: true,
  //             type: true,
  //             updatedAt: true
  //           }
  //         },
  //         creator: {
  //           select: {
  //             id: true,
  //             updatedAt: true,
  //             user: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 email: true,
  //                 phone: true,
  //                 photoURL: true,
  //                 updatedAt: true
  //               }
  //             }
  //           }
  //         },
  //         orderDetails: {
  //           where: {
  //             isPublic: true
  //           },
  //           select: {
  //             id: true,
  //             amount: true,
  //             note: true,
  //             status: true,
  //             product: true,
  //             productOptions: true,
  //             updatedAt: true,
  //             createdAt: true
  //           },
  //           orderBy: {
  //             createdAt: 'asc'
  //           }
  //         },
  //         updatedAt: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // async findUniqByCustomer(
  //   where: Prisma.OrderWhereUniqueInput,
  //   tokenCustomerPayload: TokenCustomerPayload
  // ) {
  //   return this.prisma.order.findFirstOrThrow({
  //     where: {
  //       id: where.id,
  //       customerId: tokenCustomerPayload.customerId
  //     },
  //     select: {
  //       id: true,
  //       code: true,
  //       bankingImages: true,
  //       isPaid: true,
  //       isSave: true,
  //       note: true,
  //       orderType: true,
  //       orderStatus: true,
  //       paymentMethod: {
  //         select: {
  //           id: true,
  //           bankCode: true,
  //           bankName: true,
  //           name: true,
  //           photoURL: true,
  //           representative: true,
  //           type: true,
  //           updatedAt: true
  //         }
  //       },
  //       creator: {
  //         select: {
  //           id: true,
  //           updatedAt: true,
  //           user: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //               phone: true,
  //               photoURL: true,
  //               updatedAt: true
  //             }
  //           }
  //         }
  //       },
  //       orderDetails: {
  //         select: {
  //           id: true,
  //           amount: true,
  //           note: true,
  //           status: true,
  //           product: true,
  //           productOptions: true,
  //           updatedAt: true,
  //           createdAt: true
  //         },
  //         orderBy: {
  //           createdAt: 'asc'
  //         }
  //       },
  //       updatedAt: true
  //     }
  //   })
  // }

  // async passOrderDetailToOrder(
  //   orderDetails: OrderDetail[],
  //   orderId: string,
  //   prisma: PrismaClient,
  //   tokenPayload: TokenPayload
  // ) {
  //   if (orderDetails.length <= 0)
  //     throw new CustomHttpException(
  //       HttpStatus.NOT_FOUND,
  //       'Không tìm thấy thông tin sản phẩm!'
  //     )

  //   const orderDetailIds = orderDetails?.map(orderDetail => orderDetail.id)

  //   return await prisma.orderDetail.updateMany({
  //     data: {
  //       tableId: null,
  //       updatedBy: tokenPayload.accountId,
  //       orderId: orderId
  //     },
  //     where: {
  //       id: {
  //         in: orderDetailIds
  //       },
  //       isPublic: true
  //     }
  //   })
  // }

  // async getOrderDetailsInTable(tableId: string, prisma: PrismaClient) {
  //   await this.updateOrderDetailsStatus(prisma, { tableId })

  //   const orderDetails = await prisma.orderDetail.findMany({
  //     where: {
  //       tableId
  //     }
  //   })

  //   return orderDetails
  // }

  // async updateOrderDetailsStatus(
  //   prisma: PrismaClient,
  //   conditions: { tableId?: string; orderId?: string }
  // ) {
  //   await prisma.orderDetail.updateMany({
  //     where: {
  //       ...conditions,
  //       status: ORDER_STATUS_COMMON.CANCELLED,
  //       isPublic: true
  //     },
  //     data: {
  //       isPublic: false
  //     }
  //   })

  //   await prisma.orderDetail.updateMany({
  //     where: {
  //       ...conditions,

  //       status: {
  //         not: ORDER_STATUS_COMMON.SUCCESS
  //       }
  //     },
  //     data: {
  //       status: ORDER_STATUS_COMMON.SUCCESS
  //     }
  //   })
  // }

  // async getDiscountCustomer(totalOrder: number, customer: ICustomer) {
  //   if (customer && customer.endow === ENDOW_TYPE.BY_CUSTOMER) {
  //     if (customer.discountType == DISCOUNT_TYPE.PERCENT) {
  //       return (totalOrder * customer.discount) / 100
  //     }

  //     if (customer.discountType == DISCOUNT_TYPE.VALUE) {
  //       return Math.min(customer.discount, totalOrder)
  //     }
  //   }

  //   if (customer.customerType && customer.endow === ENDOW_TYPE.BY_GROUP) {
  //     if (customer.customerType.discountType == DISCOUNT_TYPE.PERCENT) {
  //       return (totalOrder * customer.customerType.discount) / 100
  //     }

  //     if (customer.customerType.discountType == DISCOUNT_TYPE.VALUE) {
  //       return Math.min(customer.customerType.discount, totalOrder)
  //     }
  //   }

  //   return 0
  // }

  // async paymentOrder(
  //   params: {
  //     where: Prisma.OrderWhereUniqueInput
  //     data: PaymentOrderDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params

  //   return await this.prisma.$transaction(
  //     async (prisma: PrismaClient) => {
  //       await this.updateOrderDetailsStatus(prisma, { orderId: where.id })

  //       const order = await prisma.order.findFirstOrThrow({
  //         where: { id: where.id, isPublic: true },
  //         select: {
  //           id: true,
  //           customerId: true,
  //           isPaid: true,
  //           customerDiscount: true,
  //           orderType: true,
  //           orderDetails: {
  //             where: {
  //               isPublic: true
  //             }
  //           }
  //         }
  //       })

  //       const totalOrder = this.getTotalInOrder(order.orderDetails)
  //       const orderProducts = this.mapOrderProducts(order.orderDetails)

  //       if (order.isPaid)
  //         throw new CustomHttpException(
  //           HttpStatus.CONFLICT,
  //           'Đơn hàng này đã thành toán!'
  //         )

  //       const [
  //         promotionPromise,
  //         discountCodePromise,
  //         customerDiscountPromise,
  //         convertedPointValuePromise
  //       ] = await Promise.all([
  //         data.promotionId
  //           ? this.getPromotion(
  //               data.promotionId,
  //               orderProducts,
  //               tokenPayload.branchId,
  //               prisma
  //             )
  //           : undefined,
  //         data.discountCode
  //           ? this.getDiscountCode(
  //               data.discountCode,
  //               totalOrder,
  //               tokenPayload.branchId,
  //               prisma
  //             )
  //           : undefined,
  //         data.customerId
  //           ? this.getCustomerDiscount(data.customerId)
  //           : undefined,
  //         data.exchangePoint
  //           ? this.pointAccumulationService.convertDiscountFromPoint(
  //               data.exchangePoint,
  //               tokenPayload.shopId
  //             )
  //           : undefined
  //       ])

  //       // Xử lý tích điểm
  //       if (order.customerId) {
  //         await this.pointAccumulationService.handlePoint(
  //           order.customerId,
  //           order.id,
  //           data.exchangePoint,
  //           totalOrder,
  //           tokenPayload.shopId,
  //           prisma
  //         )
  //       }

  //       await this.commonService.createActivityLog(
  //         [order.id],
  //         'Order',
  //         ACTIVITY_LOG_TYPE.PAYMENT,
  //         tokenPayload
  //       )

  //       return await prisma.order.update({
  //         where: { id: where.id, isPublic: true },
  //         data: {
  //           isPaid: true,
  //           note: data.note,
  //           orderType: data.orderType,
  //           convertedPointValue: convertedPointValuePromise ?? 0,
  //           promotion: promotionPromise,
  //           discountCode: discountCodePromise,
  //           customerDiscount: customerDiscountPromise,
  //           usedPoint: data.exchangePoint,
  //           moneyReceived: data.moneyReceived,
  //           orderStatus: data.orderStatus,
  //           bankingImages: data.bankingImages,
  //           customerId: data.customerId,
  //           paymentMethodId: data.paymentMethodId,
  //           paymentAt: new Date(),
  //           updatedBy: tokenPayload.accountId
  //         }
  //       })
  //     },
  //     {
  //       maxWait: 5000,
  //       timeout: 10000
  //     }
  //   )
  // }

  // mapOrderProducts(orderDetails: AnyObject) {
  //   const formattedOrderDetails = orderDetails.map(detail => ({
  //     productId: detail.product?.id,
  //     amount: detail.amount
  //   }))

  //   const orderProducts = this.commonService.aggregateOrderProducts(
  //     formattedOrderDetails
  //   )

  //   return orderProducts
  // }

  // async getCustomerDiscount(customerId: string, prisma?: PrismaClient) {
  //   prisma = prisma || this.prisma
  //   return prisma.customer.findFirstOrThrow({
  //     where: { id: customerId },
  //     select: {
  //       id: true,
  //       address: true,
  //       name: true,
  //       birthday: true,
  //       email: true,
  //       phone: true,
  //       discount: true,
  //       discountType: true,
  //       endow: true,
  //       updatedAt: true,
  //       customerType: {
  //         where: {
  //           isPublic: true
  //         },
  //         select: {
  //           id: true,
  //           name: true,
  //           discount: true,
  //           discountType: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async deleteCustomerRequests(
  //   tableId: string,
  //   tokenPayload: TokenPayload,
  //   prisma: PrismaClient
  // ) {
  //   prisma = prisma || this.prisma
  //   await prisma.customerRequest.updateMany({
  //     where: {
  //       tableId
  //     },
  //     data: {
  //       isPublic: false,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })
  // }
}
