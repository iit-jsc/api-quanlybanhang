import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { PrismaService } from 'nestjs-prisma';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'utils/Helps';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateTableDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      'Table',
      tokenPayload.branchId,
    );

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
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
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
              isPublic: true,
            },
          },
          updatedAt: true,
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
          where: { isPublic: true },
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
              where: {
                isPublic: true,
                product: { isPublic: true },
                topping: { isPublic: true },
              },
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

    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      'Table',
      tokenPayload.branchId,
      where.id,
    );

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
        branchId: tokenPayload.branchId,
      },
      data: {
        name: data.name,
        code: data.code,
        photoURL: data.photoURL,
        description: data.description,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
        area: {
          connect: {
            id: data.areaId,
            isPublic: true,
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    return this.prisma.table.updateMany({
      where: {
        id: {
          in: data.ids,
        },
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
