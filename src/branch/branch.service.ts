import { CreateBranchDTO } from 'src/branch/dto/create-branch.dto';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { UserService } from 'src/user/user.service';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDTO } from 'utils/Common.dto';
import { BRANCH_SELECT } from 'enums/select.enum';

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
    let { skip, take, keyword } = params;

    let where: Prisma.BranchWhereInput = {
      isPublic: true,
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
      detailPermissions: {
        some: {
          isPublic: true,
        },
      },
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.branch.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: BRANCH_SELECT,
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
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        detailPermissions: {
          some: {
            isPublic: true,
          },
        },
      },
      select: BRANCH_SELECT,
    });
  }

  async update(
    params: {
      where: Prisma.BranchWhereUniqueInput;
      data: Prisma.BranchUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.branch.update({
      data: {
        name: data.name,
        address: data.address,
        status: data.status,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        detailPermissions: {
          some: {
            isPublic: true,
          },
        },
      },
    });
  }

  async removeMany(where: Prisma.BranchWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.branch.updateMany({
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        detailPermissions: {
          some: {
            isPublic: true,
          },
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async updatePhotoURL(
    params: {
      where: Prisma.BranchWhereUniqueInput;
      data: Prisma.BranchUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.branch.update({
      data: {
        photoURL: data.photoURL,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        detailPermissions: {
          some: {
            isPublic: true,
          },
        },
      },
    });
  }
}
