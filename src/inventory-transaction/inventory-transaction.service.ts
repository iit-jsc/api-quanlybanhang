import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateInventoryTransactionDto, UpdateInventoryTransactionDto } from "./dto/inventory-transaction.dto";
import { AnyObject, DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { INVENTORY_TRANSACTION_STATUS, INVENTORY_TRANSACTION_TYPE } from "enums/common.enum";
import { InventoryTransactionDetail, Prisma } from "@prisma/client";
import { CustomHttpException } from "utils/ApiErrors";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class InventoryTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async checkQuantityValid(quantity: number, productId: string, warehouseId: string) {
    const stock = await this.prisma.stock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
      select: {
        id: true,
        quantity: true,
      },
    });

    if (!stock || stock.quantity < quantity)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Số lượng không hợp lệ!");
  }

  async handleProcessedTransaction(
    data: CreateInventoryTransactionDto | UpdateInventoryTransactionDto,
    prisma: AnyObject,
    tokenPayload: TokenPayload,
  ) {
    if (!data.inventoryTransactionDetails)
      throw new CustomHttpException(HttpStatus.BAD_REQUEST, "Không được để trống!", [
        { inventoryTransactionDetails: "Không được để trống!" },
      ]);

    await Promise.all(
      data.inventoryTransactionDetails.map(async (detail) => {
        if (data.type === INVENTORY_TRANSACTION_TYPE.EXPORT)
          await this.checkQuantityValid(detail.actualQuantity, detail.productId, data.warehouseId);

        return prisma.stock.upsert({
          where: {
            productId_warehouseId: {
              productId: detail.productId,
              warehouseId: data.warehouseId,
            },
          },
          create: {
            productId: detail.productId,
            warehouseId: data.warehouseId,
            quantity: detail.actualQuantity,
            branchId: tokenPayload.branchId,
            createdBy: tokenPayload.accountId,
            updatedBy: tokenPayload.accountId,
          },
          update: {
            quantity:
              data.type === INVENTORY_TRANSACTION_TYPE.IMPORT
                ? { increment: detail.actualQuantity }
                : { decrement: detail.actualQuantity },
            updatedBy: tokenPayload.accountId,
          },
        });
      }),
    );
  }

  async create(data: CreateInventoryTransactionDto, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma) => {
      const inventoryTransaction = await prisma.inventoryTransaction.create({
        data: {
          status: data.status,
          warehouseId: data.warehouseId,
          supplierId: data.supplierId,
          type: data.type,
          code: data.code,
          importWarehouse: data.importWarehouse,
          importAddress: data.importAddress,
          importOrderCode: data.importOrderCode,
          inventoryTransactionDetails: {
            createMany: {
              data: data.inventoryTransactionDetails.map((detail) => ({
                productId: detail.productId,
                actualQuantity: detail.actualQuantity,
                price: detail.price,
                documentQuantity: detail.documentQuantity,
              })),
            },
          },
          branchId: tokenPayload.branchId,
          createdBy: tokenPayload.accountId,
        },
      });

      if (data.status == INVENTORY_TRANSACTION_STATUS.PROCESSED)
        await this.handleProcessedTransaction(data, prisma, tokenPayload);

      return inventoryTransaction;
    });
  }

  async update(
    params: {
      where: Prisma.InventoryTransactionWhereUniqueInput;
      data: UpdateInventoryTransactionDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.$transaction(async (prisma) => {
      const inventoryTransaction = await prisma.inventoryTransaction.findUniqueOrThrow({
        where: {
          id: where.id,
          branchId: tokenPayload.branchId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (inventoryTransaction.status === INVENTORY_TRANSACTION_STATUS.PROCESSED)
        throw new CustomHttpException(HttpStatus.CONFLICT, "Không thể cập nhật vì đã được xử lý!");

      if (data.status === INVENTORY_TRANSACTION_STATUS.PROCESSED)
        await this.handleProcessedTransaction(data, prisma, tokenPayload);

      return await prisma.inventoryTransaction.update({
        where: {
          id: params.where.id,
          branchId: tokenPayload.branchId,
        },
        data: {
          status: data.status,
          warehouseId: data.warehouseId,
          supplierId: data.supplierId,
          type: data.type,
          code: data.code,
          importWarehouse: data.importWarehouse,
          importAddress: data.importAddress,
          importOrderCode: data.importOrderCode,
          ...(data.inventoryTransactionDetails
            ? {
                inventoryTransactionDetails: {
                  deleteMany: {
                    inventoryTransactionId: where.id,
                  },
                  createMany: {
                    data: data.inventoryTransactionDetails.map((detail) => ({
                      productId: detail.productId,
                      actualQuantity: detail.actualQuantity,
                      price: detail.price,
                      documentQuantity: detail.documentQuantity,
                    })),
                  },
                },
              }
            : {}),
          branchId: tokenPayload.branchId,
          updatedBy: tokenPayload.accountId,
        },
      });
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, types, from, to, orderBy } = params;
    let where: Prisma.InventoryTransactionWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
      ...(types && { type: { in: types } }),
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
      branchId: tokenPayload.branchId,
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.inventoryTransaction.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          type: true,
          code: true,
          status: true,
          importWarehouse: true,
          importAddress: true,
          importOrderCode: true,
          supplier: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          inventoryTransactionDetails: {
            where: { isPublic: true },
            select: {
              id: true,
              actualQuantity: true,
              documentQuantity: true,
              price: true,
            },
          },
          creator: {
            select: {
              username: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  photoURL: true,
                },
              },
            },
          },
          updatedAt: true,
        },
      }),
      this.prisma.inventoryTransaction.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.InventoryTransactionWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.inventoryTransaction.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        type: true,
        code: true,
        status: true,
        importWarehouse: true,
        importAddress: true,
        importOrderCode: true,
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        inventoryTransactionDetails: {
          where: { isPublic: true },
          select: {
            id: true,
            actualQuantity: true,
            documentQuantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                code: true,
                photoURLs: true,
                measurementUnit: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
        creator: {
          select: {
            username: true,
            user: {
              select: {
                id: true,
                name: true,
                code: true,
                photoURL: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const processedInventories = await this.prisma.inventoryTransaction.findMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branchId: tokenPayload.branchId,
        status: INVENTORY_TRANSACTION_STATUS.PROCESSED,
      },
      select: {
        id: true,
        code: true,
      },
    });

    const notDeletedIds = processedInventories.map((inventory) => inventory.id);

    const idsToDelete = data.ids.filter((id) => !notDeletedIds.includes(id));

    const count = await this.prisma.inventoryTransaction.updateMany({
      where: {
        id: {
          in: idsToDelete,
        },
        status: INVENTORY_TRANSACTION_STATUS.DRAFT,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, ids: idsToDelete, notValidIds: notDeletedIds } as DeleteManyResponse;
  }
}
