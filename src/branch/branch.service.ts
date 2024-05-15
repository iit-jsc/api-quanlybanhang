import { CreateBranchDTO } from 'src/branch/dto/create-branch.dto';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { UserService } from 'src/user/user.service';
import {
  FindManyDTO,
  calculatePagination,
  determineAccessConditions,
} from 'utils/Helps';
import { Prisma } from '@prisma/client';
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

    const where = determineAccessConditions(tokenPayload);

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
        ...determineAccessConditions(tokenPayload),
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
        ...determineAccessConditions(tokenPayload),
      },
    });
  }

  async removeMany(where: Prisma.BranchWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.branch.updateMany({
      where: {
        ...where,
        ...determineAccessConditions(tokenPayload),
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
        ...determineAccessConditions(tokenPayload),
      },
    });
  }
}
