import { CreateBranchDTO } from 'src/branch/dto/create-branch.dto';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { UserService } from 'src/user/user.service';
import { FindManyDTO, calculatePagination } from 'utils/Helps';
import { Prisma, PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { DEFAULT_OPTION_FIND } from 'enums/common.enum';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(createBranchDto: CreateBranchDTO, tokenPayload: TokenPayload) {
    const user = await this.userService.getByAccountId(tokenPayload.accountId);

    return this.prisma.branch.create({
      data: {
        name: createBranchDto.name,
        address: createBranchDto.address,
        photoURL: createBranchDto.photoURL,
        status: createBranchDto.status,
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
        shop: {
          connect: {
            id: tokenPayload.shopId,
          },
        },
        detailPermissions: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
      },
    });
  }

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    let { skip, take } = params;

    const where = {
      isPublic: true,
      shopId: tokenPayload.shopId,
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.branch.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          photoURL: true,
          address: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.branch.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.BranchWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return await this.prisma.branch.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        shopId: tokenPayload.shopId,
      },
      select: {
        id: true,
        name: true,
        photoURL: true,
        address: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.MeasurementUnitWhereUniqueInput;
      data: Prisma.MeasurementUnitUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
  }
}
