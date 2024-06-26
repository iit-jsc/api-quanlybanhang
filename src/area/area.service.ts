import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';
import { CreateAreaDto } from './dto/create-area.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class AreaService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateAreaDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      'Area',
      tokenPayload.branchId,
    );

    return await this.prisma.area.create({
      data: {
        ...(data.code && {
          code: data.code,
        }),
        name: data.name,
        description: data.description,
        photoURL: data.photoURL,
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
    const { skip, take, keyword } = params;

    const keySearch = ['name', 'code'];

    const where: Prisma.AreaWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.area.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          photoURL: true,
          tables: {
            where: {
              isPublic: true,
            },
            select: {
              id: true,
              name: true,
              code: true,
              photoURL: true,
              description: true,
            },
          },
        },
      }),
      this.prisma.area.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.AreaWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.area.findUniqueOrThrow({
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
        tables: {
          where: {
            branchId: tokenPayload.branchId,
            isPublic: true,
          },
          select: {
            id: true,
            name: true,
            code: true,
            photoURL: true,
            description: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.AreaWhereUniqueInput;
      data: CreateAreaDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      'Area',
      tokenPayload.branchId,
      where.id,
    );

    return this.prisma.area.update({
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
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async removeMany(where: Prisma.AreaWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.area.updateMany({
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
