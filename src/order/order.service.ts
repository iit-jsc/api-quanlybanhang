import { HttpStatus, Injectable } from "@nestjs/common";
import { PaymentOrderDto, CreateOrderDto, OrderProducts, UpdateOrderDto } from "./dto/order.dto";
import { CustomerShape, PromotionCountOrder, TokenCustomerPayload, TokenPayload } from "interfaces/common.interface";
import { CreateOrderOnlineDto } from "./dto/create-order-online.dto";
import { CreateOrderToTableDto } from "./dto/create-order-to-table.dto";
import { OrderDetail, Prisma, PrismaClient, Product, Promotion, Topping } from "@prisma/client";
import { PaymentFromTableDto } from "./dto/payment-order-from-table.dto";
import { FindManyDto, DeleteManyDto } from "utils/Common.dto";
import { SeparateTableDto } from "./dto/separate-table.dto";
import { CreateOrderToTableByCustomerDto } from "./dto/create-order-to-table-by-customer.dto";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { DETAIL_ORDER_STATUS, ORDER_STATUS_COMMON, ORDER_TYPE, TRANSACTION_TYPE } from "enums/order.enum";
import { calculatePagination, generateSortCode } from "utils/Helps";
import { CustomHttpException } from "utils/ApiErrors";
import { SaveOrderDto } from "./dto/save-order.dto";
import { ACTIVITY_LOG_TYPE, DISCOUNT_TYPE, PROMOTION_TYPE } from "enums/common.enum";
import { OrderGateway } from "src/gateway/order.gateway";
import { TableGateway } from "src/gateway/table.gateway";
import { PointAccumulationService } from "src/point-accumulation/point-accumulation.service";
import { ENDOW_TYPE } from "enums/user.enum";

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
    private readonly orderGateway: OrderGateway,
    private readonly tableGateway: TableGateway,
    private readonly pointAccumulationService: PointAccumulationService,
  ) {}

  async getOrderDetails(orderProducts: OrderProducts[], status?: number, tokenPayload?: TokenPayload) {
    return await Promise.all(
      orderProducts.map(async (product) => {
        const productExist = (await this.commonService.findByIdWithBranch(
          product.productId,
          "Product",
          tokenPayload.branchId,
        )) as Product;

        const toppingExist = product.toppingId
          ? ((await this.commonService.findByIdWithBranch(
              product.toppingId,
              "Topping",
              tokenPayload.branchId,
            )) as Topping)
          : null;

        return {
          ...(product.toppingId && {
            toppingId: product.toppingId,
            toppingPrice: toppingExist.price,
          }),
          productPrice: productExist.price,
          productId: product.productId,
          amount: product.amount,
          status,
          branchId: tokenPayload.branchId,
          createdBy: tokenPayload.accountId,
          updatedBy: tokenPayload.accountId,
        } as OrderDetail;
      }),
    );
  }

  async getMatchPromotion(promotionId: string, orderProducts: OrderProducts[], branchId: string): Promise<Promotion> {
    const matchPromotions = await this.prisma.promotion.findMany({
      where: {
        isPublic: true,
        branchId: branchId,
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        AND: [
          {
            OR: [
              {
                promotionConditions: {
                  some: {
                    OR: orderProducts.map((order) => ({
                      productId: order.productId,
                      amount: {
                        lte: order.amount,
                      },
                    })),
                  },
                },
              },
              {
                promotionConditions: {
                  none: {},
                },
              },
            ],
          },
          {
            OR: [
              {
                endDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              {
                isEndDateDisabled: true,
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        type: true,
        value: true,
        typeValue: true,
        isLimit: true,
        amount: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    const matchPromotion = matchPromotions.find((promotion) => promotion.id === promotionId);

    if (!matchPromotion) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Khuyến mãi không hợp lệ!");

    if (matchPromotion._count.orders >= matchPromotion.amount)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Số lượng đã hết!");

    return matchPromotion as PromotionCountOrder;
  }

  getTotalInOrder(orderDetails: OrderDetail[]) {
    return orderDetails.reduce(
      (total, order) => total + order.amount * (order.productPrice + (order.toppingPrice || 0)),
      0,
    );
  }

  async getPromotionValue(promotionId: string, orderDetails: OrderDetail[], branchId: string) {
    const matchPromotion = await this.getMatchPromotion(promotionId, orderDetails, branchId);

    if (matchPromotion.type == PROMOTION_TYPE.GIFT) return 0;

    const totalOrder = this.getTotalInOrder(orderDetails);

    if (matchPromotion.typeValue == DISCOUNT_TYPE.PERCENT) {
      return (totalOrder * matchPromotion.value) / 100;
    }

    if (matchPromotion.typeValue == DISCOUNT_TYPE.VALUE) {
      return Math.min(matchPromotion.value, totalOrder);
    }
  }

  async getDiscountValue(totalOrder: number, code: string, branchId: string) {
    let discountValue = 0;

    const discountIssue = await this.prisma.discountIssue.findFirst({
      where: {
        isPublic: true,
        branchId,
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        AND: [
          {
            OR: [
              {
                endDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              {
                isEndDateDisabled: true,
              },
            ],
          },
        ],
        discountCodes: {
          some: {
            code: code,
            isUsed: false,
            isPublic: true,
          },
        },
      },
    });

    if (!discountIssue)
      throw new CustomHttpException(HttpStatus.NOT_FOUND, "Mã giảm giá không tồn tại hoặc đã hết hạn!");

    if (discountIssue.minTotalOrder && discountIssue.minTotalOrder > totalOrder)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Giá trị đơn hàng chưa đủ điều kiện!");

    if (discountIssue.type == DISCOUNT_TYPE.PERCENT) {
      const discountTotal = (totalOrder * discountIssue.value) / 100;

      discountValue = Math.min(discountTotal, discountIssue.maxValue);
    }

    if (discountIssue.type == DISCOUNT_TYPE.VALUE) discountValue = discountIssue.value;

    return Math.min(discountValue, totalOrder);
  }

  async create(data: CreateOrderDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch({ code: data.code }, "Order", tokenPayload.branchId);

    const orderDetails = await this.getOrderDetails(data.orderProducts, DETAIL_ORDER_STATUS.SUCCESS, tokenPayload);

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const order = await prisma.order.create({
        data: {
          note: data.note,
          orderType: ORDER_TYPE.OFFLINE,
          orderStatus: data.orderStatus || ORDER_STATUS_COMMON.APPROVED,
          code: data.code || generateSortCode(),
          ...(data.customerId && {
            customer: {
              connect: {
                id: data.customerId,
              },
            },
          }),
          orderDetails: {
            createMany: {
              data: orderDetails,
            },
          },
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          orderDetails: {
            select: {
              id: true,
              amount: true,
              note: true,
              productPrice: true,
              toppingPrice: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                  code: true,
                },
              },
              topping: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                },
              },
            },
          },
        },
      });

      // Gửi socket
      await this.orderGateway.handleModifyOrder(order);

      await this.commonService.createActivityLog([order.id], "Order", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

      return order;
    });
  }

  async createOrderToTableByEmployee(data: CreateOrderToTableDto, tokenPayload: TokenPayload) {
    const orderDetails = await this.getOrderDetails(data.orderProducts, DETAIL_ORDER_STATUS.APPROVED, tokenPayload);

    const table = await this.prisma.table.update({
      where: { id: data.tableId },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
        updatedBy: tokenPayload.accountId,
      },
      include: {
        orderDetails: true,
      },
    });

    // Bắn socket cho các người dùng
    await this.tableGateway.handleModifyTable(table);

    await this.commonService.createActivityLog([table.id], "Table", ACTIVITY_LOG_TYPE.CREATE_TO_TABLE, tokenPayload);

    return table;
  }

  async createOrderToTableByCustomer(data: CreateOrderToTableByCustomerDto) {
    const orderDetails = await this.getOrderDetails(data.orderProducts, DETAIL_ORDER_STATUS.WAITING, {
      branchId: data.branchId,
    });

    const table = await this.prisma.table.update({
      where: { id: data.tableId },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
      },
      include: {
        orderDetails: true,
      },
    });

    // Bắn socket cho các người dùng

    await this.tableGateway.handleModifyTable(table);

    return table;
  }

  async createOrderOnline(data: CreateOrderOnlineDto) {
    let discountValue = 0;
    let convertedPointValue = 0;

    const orderDetails = await this.getOrderDetails(data.orderProducts, DETAIL_ORDER_STATUS.WAITING, {
      branchId: data.branchId,
    });

    const totalOrder = this.getTotalInOrder(orderDetails);

    const customer = await this.commonService.findOrCreateCustomer(
      {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
      { phone: data.phone, branchId: data.branchId },
    );

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      if (data.discountCode) {
        discountValue = await this.getDiscountValue(totalOrder, data.discountCode, data.branchId);

        await prisma.discountCode.update({
          where: {
            branchId_code: {
              branchId: data.branchId,
              code: data.discountCode,
            },
          },
          data: { isUsed: true },
        });
      }

      if (data.exchangePoint) {
        const totalInOrder = this.getTotalInOrder(orderDetails);

        await this.pointAccumulationService.checkValidExchangePoint(
          customer.id,
          data.exchangePoint,
          totalInOrder,
          customer.shopId,
        );

        convertedPointValue = await this.pointAccumulationService.convertDiscountFromPoint(
          data.exchangePoint,
          customer.shopId,
        );
      }

      const order = await this.prisma.order.create({
        data: {
          note: data.note,
          convertedPointValue,
          discountValue,
          orderType: ORDER_TYPE.ONLINE,
          orderStatus: ORDER_STATUS_COMMON.WAITING,
          code: generateSortCode(),
          customer: {
            connect: {
              id: customer.id,
            },
          },
          orderDetails: {
            createMany: {
              data: orderDetails,
            },
          },
          branch: {
            connect: {
              id: data.branchId,
              isPublic: true,
            },
          },
        },
        include: {
          orderDetails: true,
        },
      });

      // Gửi socket
      await this.orderGateway.handleModifyOrder(order);

      return order;
    });
  }

  async paymentFromTable(data: PaymentFromTableDto, tokenPayload: TokenPayload) {
    let promotionValue = 0;
    let discountValue = 0;
    let customerDiscountValue = 0;

    const newOrder = await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const orderDetails = await this.getOrderDetailsInTable(data.tableId, prisma);

      const totalOrder = this.getTotalInOrder(orderDetails);

      if (data.promotionId)
        promotionValue = await this.getPromotionValue(data.promotionId, orderDetails, tokenPayload.branchId);

      if (data.discountCode) {
        discountValue = await this.getDiscountValue(totalOrder, data.discountCode, tokenPayload.branchId);

        await prisma.discountCode.update({
          where: {
            branchId_code: {
              branchId: tokenPayload.branchId,
              code: data.discountCode,
            },
          },
          data: { isUsed: true, updatedBy: tokenPayload.accountId },
        });
      }

      if (data.customerId) {
        const customer = await this.prisma.customer.findFirstOrThrow({
          where: { id: data.customerId },
          select: {
            id: true,
            discount: true,
            discountType: true,
            endow: true,
            customerType: {
              select: {
                id: true,
                discount: true,
                discountType: true,
              },
              where: {
                isPublic: true,
              },
            },
          },
        });

        customerDiscountValue = await this.getDiscountCustomer(totalOrder, customer);
      }

      const convertedPointValue = await this.pointAccumulationService.convertDiscountFromPoint(
        data.exchangePoint,
        tokenPayload.shopId,
      );

      // Kiểm tra giảm giá hợp lệ
      if (promotionValue + discountValue + convertedPointValue + customerDiscountValue > totalOrder)
        throw new CustomHttpException(HttpStatus.CONFLICT, "Giảm giá vượt quá tổng số tiền của đơn hàng!");

      if (data.moneyReceived < totalOrder)
        throw new CustomHttpException(HttpStatus.CONFLICT, "Tiền nhận không hợp lệ!");

      const order = await prisma.order.create({
        data: {
          code: generateSortCode(),
          note: data.note,
          orderType: ORDER_TYPE.OFFLINE,
          orderStatus: ORDER_STATUS_COMMON.SUCCESS,
          bankingImages: data.bankingImages,
          isPaid: true,
          promotionValue: promotionValue,
          discountValue: discountValue,
          convertedPointValue,
          usedPoint: data.exchangePoint,
          moneyReceived: data.moneyReceived,
          customerDiscountValue,
          ...(data.customerId && {
            customer: {
              connect: {
                id: data.customerId,
              },
            },
          }),
          paymentMethod: {
            connect: {
              id: data.paymentMethodId,
            },
          },
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
          updater: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
        },
      });

      await this.passOrderDetailToOrder(orderDetails, order.id, prisma, tokenPayload);

      await this.deleteTableTransaction(data.tableId, prisma, tokenPayload);

      // Xử lý tích điểm
      if (data.customerId) {
        await this.pointAccumulationService.handlePoint(
          data.customerId,
          order.id,
          data.exchangePoint,
          totalOrder,
          tokenPayload.shopId,
          prisma,
        );
      }

      await this.commonService.createActivityLog([order.id], "Order", ACTIVITY_LOG_TYPE.PAYMENT, tokenPayload);

      return order;
    });

    return newOrder;
  }

  async update(
    params: {
      where: Prisma.OrderWhereUniqueInput;
      data: UpdateOrderDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.commonService.checkOrderChange(where.id);

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const order = await prisma.order.update({
        where: {
          id: where.id,
          branch: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
        data: {
          orderStatus: data.orderStatus,
          note: data.note,
          cancelReason: data.cancelReason,
          cancelDate: data.cancelDate,
          bankingImages: data.bankingImages,
          paymentMethod: {
            connect: {
              id: data.paymentMethodId,
            },
          },
          updater: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
        },
        include: {
          orderDetails: true,
        },
      });

      await this.commonService.createActivityLog([order.id], "Order", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

      return order;
    });
  }

  async separateTable(data: SeparateTableDto, tokenPayload: TokenPayload) {
    const { fromTableId, toTableId, orderDetailIds } = data;

    await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const response = await prisma.orderDetail.updateMany({
        data: {
          tableId: toTableId,
          updatedBy: tokenPayload.accountId,
        },
        where: {
          id: {
            in: orderDetailIds,
          },
          isPublic: true,
          table: {
            isPublic: true,
            id: fromTableId,
          },
        },
      });

      if (response.count > 0) {
        const moveTransaction = this.createTransaction(
          data.fromTableId,
          TRANSACTION_TYPE.MOVE,
          orderDetailIds,
          tokenPayload,
          prisma,
        );

        const movedTransaction = this.createTransaction(
          data.toTableId,
          TRANSACTION_TYPE.MOVED,
          orderDetailIds,
          tokenPayload,
          prisma,
        );

        // delete table transaction nếu table không còn order
        const countOrderDetail = await prisma.orderDetail.count({
          where: { tableId: data.fromTableId, isPublic: true },
        });

        if (countOrderDetail == 0) await this.deleteTableTransaction(data.fromTableId, prisma, tokenPayload);

        await Promise.all([moveTransaction, movedTransaction]);
      }

      return response;
    });
  }

  async createTransaction(
    tableId: string,
    type: number,
    orderDetailIds: string[] | null,
    tokenPayload: TokenPayload,
    prisma: PrismaClient,
  ) {
    return prisma.tableTransaction.create({
      data: {
        type: type,
        branch: {
          connect: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
        table: {
          connect: {
            id: tableId,
          },
        },
        ...(orderDetailIds && {
          orderDetails: {
            connect: orderDetailIds.map((id) => ({ id })),
          },
        }),
        creator: {
          connect: {
            id: tokenPayload.accountId,
            isPublic: true,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, customerId, from, to, orderTypes, isPaid, orderBy } = params;

    const keySearch = ["code"];

    const where: Prisma.OrderWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
      ...(customerId && {
        customerId: customerId,
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(orderTypes?.length > 0 && {
        orderType: { in: orderTypes },
      }),
      ...(isPaid && {
        isPaid,
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          isPaid: true,
          orderStatus: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              email: true,
            },
          },
          orderDetails: {
            select: {
              id: true,
              amount: true,
              note: true,
              productPrice: true,
              toppingPrice: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                  code: true,
                },
              },
              topping: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                },
              },
            },
            where: {
              isPublic: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.order.count({
        where,
      }),
    ]);
    return {
      list: data,

      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.OrderWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.order.findFirstOrThrow({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      include: {
        promotion: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            email: true,
          },
        },
        orderDetails: {
          select: {
            id: true,
            amount: true,
            note: true,
            productPrice: true,
            toppingPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
                code: true,
              },
            },
            topping: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
              },
            },
          },
          where: {
            isPublic: true,
          },
        },
        paymentMethod: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });
  }

  async saveOrder(
    params: {
      where: Prisma.OrderWhereUniqueInput;
      data: SaveOrderDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return await this.prisma.order.update({
      where: {
        id: where.id,
        branch: { isPublic: true, id: tokenPayload.branchId },
      },
      data: {
        isSave: data.isSave,
        note: data.note,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const ordersPaid = await this.prisma.order.findMany({
      where: { id: { in: data.ids }, isPublic: true, isPaid: true },
      select: { id: true },
    });

    const ordersPaidIds = ordersPaid.map((order) => order.id);

    const idsToDelete = data.ids.filter((id) => !ordersPaidIds.includes(id));

    const count = await this.prisma.order.updateMany({
      where: {
        id: {
          in: idsToDelete,
        },
        branch: { isPublic: true, id: tokenPayload.branchId },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(data.ids, "Order", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return {
      ...count,
      ids: data.ids,
      deletedIds: idsToDelete,
      notDeletedIds: ordersPaidIds,
    };
  }

  async findAllByCustomer(params: FindManyDto, tokenCustomerPayload: TokenCustomerPayload) {
    let { skip, take, keyword, from, to } = params;

    const keySearch = ["code"];

    let where: Prisma.OrderWhereInput = {
      isPublic: true,
      customerId: tokenCustomerPayload.customerId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: from,
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          code: true,
          isPaid: true,
          orderStatus: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              email: true,
            },
          },
          orderDetails: {
            select: {
              id: true,
              amount: true,
              note: true,
              productPrice: true,
              toppingPrice: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                  code: true,
                },
              },
              topping: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                },
              },
            },
          },
          createdAt: true,
        },
      }),
      this.prisma.order.count({
        where,
      }),
    ]);
    return {
      list: data,

      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniqByCustomer(where: Prisma.OrderWhereUniqueInput, tokenCustomerPayload: TokenCustomerPayload) {
    return this.prisma.order.findFirstOrThrow({
      where: {
        id: where.id,
        isPublic: true,
        customerId: tokenCustomerPayload.customerId,
      },
      include: {
        promotion: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            email: true,
          },
        },
        orderDetails: {
          select: {
            id: true,
            amount: true,
            note: true,
            productPrice: true,
            toppingPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
                code: true,
              },
            },
            topping: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
              },
            },
          },
        },
      },
    });
  }

  async passOrderDetailToOrder(
    orderDetails: OrderDetail[],
    orderId: string,
    prisma: PrismaClient,
    tokenPayload: TokenPayload,
  ) {
    if (orderDetails.length <= 0)
      throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sản phẩm!");

    const orderDetailIds = orderDetails?.map((orderDetail) => orderDetail.id);

    return await prisma.orderDetail.updateMany({
      data: {
        tableId: null,
        updatedBy: tokenPayload.accountId,
        orderId: orderId,
      },
      where: {
        id: {
          in: orderDetailIds,
        },
        isPublic: true,
      },
    });
  }

  async deleteTableTransaction(tableId: string, prisma: PrismaClient, tokenPayload: TokenPayload) {
    await prisma.tableTransaction.updateMany({
      where: {
        tableId,
        isPublic: true,
      },
      data: { isPublic: false, updatedBy: tokenPayload.accountId },
    });
  }

  async getOrderDetailsInTable(tableId: string, prisma: PrismaClient) {
    return prisma.orderDetail.findMany({ where: { tableId, isPublic: true } });
  }

  async getDiscountCustomer(totalOrder: number, customer: CustomerShape) {
    if (customer && customer.endow === ENDOW_TYPE.BY_CUSTOMER) {
      if (customer.discountType == DISCOUNT_TYPE.PERCENT) {
        return (totalOrder * customer.discount) / 100;
      }

      if (customer.discountType == DISCOUNT_TYPE.VALUE) {
        return Math.min(customer.discount, totalOrder);
      }
    }

    if (customer.customerType && customer.endow === ENDOW_TYPE.BY_GROUP) {
      if (customer.customerType.discountType == DISCOUNT_TYPE.PERCENT) {
        return (totalOrder * customer.customerType.discount) / 100;
      }

      if (customer.customerType.discountType == DISCOUNT_TYPE.VALUE) {
        return Math.min(customer.customerType.discount, totalOrder);
      }
    }

    return 0;
  }

  async paymentOrder(
    params: {
      where: Prisma.OrderWhereUniqueInput;
      data: PaymentOrderDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    let promotionValue = 0;
    let discountValue = 0;
    let customerDiscountValue = 0;

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const order = await prisma.order.findFirstOrThrow({
        where: { id: where.id, isPublic: true },
        select: {
          id: true,
          customerId: true,
          customer: {
            select: {
              id: true,
              discount: true,
              discountType: true,
              endow: true,
              customerType: {
                select: {
                  id: true,
                  discount: true,
                  discountType: true,
                },
                where: {
                  isPublic: true,
                },
              },
            },
          },
          isPaid: true,
          orderType: true,
          orderDetails: {
            where: {
              isPublic: true,
            },
          },
        },
      });

      const totalOrder = this.getTotalInOrder(order.orderDetails);

      if (order.isPaid) throw new CustomHttpException(HttpStatus.CONFLICT, "Đơn hàng này đã thành toán!");

      if (order.customer) customerDiscountValue = await this.getDiscountCustomer(totalOrder, order.customer);

      if (data.promotionId)
        promotionValue = await this.getPromotionValue(data.promotionId, order.orderDetails, tokenPayload.branchId);

      if (data.discountCode) {
        discountValue = await this.getDiscountValue(totalOrder, data.discountCode, tokenPayload.branchId);

        await prisma.discountCode.update({
          where: {
            branchId_code: {
              branchId: tokenPayload.branchId,
              code: data.discountCode,
            },
          },
          data: { isUsed: true, updatedBy: tokenPayload.accountId },
        });
      }

      const convertedPointValue = await this.pointAccumulationService.convertDiscountFromPoint(
        data.exchangePoint,
        tokenPayload.shopId,
      );

      // Kiểm tra giảm giá hợp lệ

      if (promotionValue + discountValue + convertedPointValue + customerDiscountValue > totalOrder)
        throw new CustomHttpException(HttpStatus.CONFLICT, "Giảm giá vượt quá tổng số tiền của đơn hàng!");

      // Xử lý tích điểm
      if (order.customerId) {
        await this.pointAccumulationService.handlePoint(
          order.customerId,
          order.id,
          data.exchangePoint,
          totalOrder,
          tokenPayload.shopId,
          prisma,
        );
      }

      await this.commonService.createActivityLog([order.id], "Order", ACTIVITY_LOG_TYPE.PAYMENT, tokenPayload);

      if (data.moneyReceived < totalOrder)
        throw new CustomHttpException(HttpStatus.CONFLICT, "Tiền nhận không hợp lệ!");

      return await prisma.order.update({
        where: { id: where.id, isPublic: true },
        data: {
          promotionValue,
          discountValue,
          isPaid: true,
          convertedPointValue,
          customerDiscountValue,
          usedPoint: data.exchangePoint,
          moneyReceived: data.moneyReceived,
          orderStatus: ORDER_STATUS_COMMON.SUCCESS,
          bankingImages: data.exchangePoint,
          paymentMethodId: data.paymentMethodId,
          updatedBy: tokenPayload.accountId,
          promotionId: data.promotionId,
        },
      });
    });
  }
}
