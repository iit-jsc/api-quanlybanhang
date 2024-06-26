import { CreateBranchDto } from 'src/branch/dto/create-branch.dto';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { UserService } from 'src/user/user.service';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { BRANCH_SELECT } from 'enums/select.enum';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(createBranchDto: CreateBranchDto, tokenPayload: TokenPayload) {
    return this.prisma.branch.create({
      data: {
        name: createBranchDto.name,
        address: createBranchDto.address,
        photoURL: createBranchDto.photoURL,
        status: createBranchDto.status,
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
        shop: {
          connect: {
            id: tokenPayload.shopId,
          },
        },
        accounts: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    let where: Prisma.BranchWhereInput = {
      isPublic: true,
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
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
        select: {
          id: true,
          photoURL: true,
          name: true,
          address: true,
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
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      select: {
        id: true,
        photoURL: true,
        name: true,
        address: true,
        createdAt: true,
      },
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
        photoURL: data.photoURL,
        status: data.status,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        accounts: {
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
        accounts: {
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
}
