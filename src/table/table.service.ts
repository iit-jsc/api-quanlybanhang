import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { PrismaService } from 'nestjs-prisma';
import { TokenPayload } from 'interfaces/common.interface';
import { FindManyDto } from 'utils/Common.dto';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'utils/Helps';
import { CommonService } from 'src/common/common.service';
import { DETAIL_ORDER_STATUS } from 'enums/order.enum';

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateTableDto, tokenPayload: TokenPayload) {
    if (data.areaId)
      await this.commonService.findByIdWithBranch(
        data.areaId,
        'Area',
        tokenPayload.branchId,
      );

    return await this.prisma.table.create({
      data: {
        ...(data.code && {
          code: data.code,
        }),
        name: data.name,
        description: data.description,
        photoURL: data.photoURL,
        area: {
          connect: {
            id: data.areaId,
            isPublic: true,
          },
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, areaIds, statusOrderDetails } = params;

    const keySearch = ['name', 'code'];

    const where: Prisma.TableWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      ...(areaIds?.length > 0 && {
        area: {
          id: { in: areaIds },
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.table.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          photoURL: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              photoURL: true,
            },
          },
          orderDetails: {
            select: {
              id: true,
              status: true,
              productPrice: true,
              toppingPrice: true,
              amount: true,
            },
            where: {
              ...(statusOrderDetails?.length > 0 && {
                status: {
                  in: statusOrderDetails,
                },
              }),
            },
          },
        },
      }),
      this.prisma.table.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.TableWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.table.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        photoURL: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            photoURL: true,
          },
        },
        orderDetails: {
          select: {
            id: true,
            amount: true,
            note: true,
            status: true,
            topping: {
              select: {
                id: true,
                name: true,
              },
            },
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                measurementUnit: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        tableTransactions: {
          where: { isPublic: true },
          select: {
            id: true,
            type: true,
            orderDetails: {
              select: {
                id: true,
                status: true,
                productPrice: true,
                toppingPrice: true,
                amount: true,
                note: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    photoURLs: true,
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
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.TableWhereUniqueInput;
      data: CreateTableDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    if (data.areaId)
      await this.commonService.findByIdWithBranch(
        data.areaId,
        'Area',
        tokenPayload.branchId,
      );

    return this.prisma.table.update({
      where: {
        id: where.id,
        isPublic: true,
        branch: {
          id: tokenPayload.branchId,
          isPublic: true,
        },
      },
      data: {
        name: data.name,
        code: data.code,
        photoURL: data.photoURL,
        description: data.description,
        area: {
          connect: {
            id: data.areaId,
            isPublic: true,
          },
        },
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async removeMany(where: Prisma.TableWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.table.updateMany({
      where: {
        ...where,
        isPublic: true,
        branch: {
          id: tokenPayload.branchId,
          isPublic: true,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
