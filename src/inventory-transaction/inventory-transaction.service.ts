import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateInventoryTransactionDto,
  UpdateInventoryTransactionDto,
} from './dto/inventory-transaction.dto';
import { TokenPayload } from 'interfaces/common.interface';
import {
  INVENTORY_TRANSACTION_STATUS,
  INVENTORY_TRANSACTION_TYPE,
} from 'enums/common.enum';
import { Prisma } from '@prisma/client';
import { CustomHttpException } from 'utils/ApiErrors';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class InventoryTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateInventoryTransactionDto,
    tokenPayload: TokenPayload,
  ) {
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
      if (data.status == INVENTORY_TRANSACTION_STATUS.PROCESSED) {
        await Promise.all(
          data.inventoryTransactionDetails.map((detail) => {
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
                quantity: {
                  increment: detail.actualQuantity,
                },
                updatedBy: tokenPayload.accountId,
              },
            });
          }),
        );
      }
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
      const inventoryTransaction =
        await prisma.inventoryTransaction.findUniqueOrThrow({
          where: {
            id: where.id,
            branchId: tokenPayload.branchId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (
        inventoryTransaction.status === INVENTORY_TRANSACTION_STATUS.PROCESSED
      )
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          '#1 update - Không thể cập nhật vì đã được xử lý!',
        );

      if (data.status === INVENTORY_TRANSACTION_STATUS.PROCESSED) {
        await Promise.all(
          data.inventoryTransactionDetails.map((detail) => {
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
                  data.status === INVENTORY_TRANSACTION_TYPE.IMPORT
                    ? { increment: detail.actualQuantity }
                    : { decrement: detail.actualQuantity },
                updatedBy: tokenPayload.accountId,
              },
            });
          }),
        );
      }

      await prisma.inventoryTransaction.update({
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
          ...(data.inventoryTransactionDetails ?? {
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
          }),
          branchId: tokenPayload.branchId,
          updatedBy: tokenPayload.accountId,
        },
      });

      return inventoryTransaction;
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, types, from, to } = params;
    let where: Prisma.InventoryTransactionWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
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
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          type: true,
          code: true,
          importWarehouse: true,
          importAddress: true,
          importOrderCode: true,
          supplier: true,
          inventoryTransactionDetails: {
            where: { isPublic: true },
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

  async findUniq(
    where: Prisma.InventoryTransactionWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
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
        importWarehouse: true,
        importAddress: true,
        importOrderCode: true,
        supplier: true,
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

  async deleteMany(
    where: Prisma.InventoryTransactionWhereInput,
    tokenPayload: TokenPayload,
  ) {
    const inventoryProcessed = await this.prisma.inventoryTransaction.findMany({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
        status: { not: INVENTORY_TRANSACTION_STATUS.PROCESSED },
      },
    });

    const count = await this.prisma.inventoryTransaction.updateMany({
      where: {
        ...where,
        status: INVENTORY_TRANSACTION_STATUS.DRAFT,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, inventoryProcessed };
  }
}
