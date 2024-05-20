import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateEmployeeGroupDTO } from './dto/create-employee-group.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { calculatePagination, onlyBranchFilter } from 'utils/Helps';
import { FindManyDTO } from 'utils/Common.dto';
import { EMPLOYEE_GROUP_SELECT } from 'enums/select.enum';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class EmployeeGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmployeeGroupDTO, tokenPayload: TokenPayload) {
    return this.prisma.employeeGroup.create({
      data: {
        name: data.name,
        description: data.description,
        branches: {
          connect: data.branchIds.map((id) => ({
            id,
          })),
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    let { skip, take, keyword, branchIds } = params;

    let where: Prisma.EmployeeGroupWhereInput = {
      isPublic: true,
      branches: {
        some: onlyBranchFilter(tokenPayload),
      },
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      ...(branchIds?.length > 0 && {
        branches: {
          some: {
            id: { in: branchIds },
          },
        },
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.employeeGroup.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: EMPLOYEE_GROUP_SELECT,
      }),
      this.prisma.employeeGroup.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.EmployeeGroupWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.employeeGroup.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: onlyBranchFilter(tokenPayload),
        },
      },
      select: EMPLOYEE_GROUP_SELECT,
    });
  }

  async update(
    params: {
      where: Prisma.EmployeeGroupWhereUniqueInput;
      data: Prisma.EmployeeGroupUpdateInput & { branchIds: number[] };
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.employeeGroup.update({
      data: {
        name: data.name,
        description: data.description,
        branches: {
          set: [],
          connect: data.branchIds.map((id) => ({
            id,
          })),
        },
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        branches: {
          some: onlyBranchFilter(tokenPayload),
        },
      },
    });
  }

  async removeMany(
    where: Prisma.EmployeeGroupWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.employeeGroup.updateMany({
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: onlyBranchFilter(tokenPayload),
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findByIdWithBranch(id: number, branchId: number) {
    const employeeGroup = await this.prisma.employeeGroup.findUnique({
      where: {
        id: +id,
        isPublic: true,
        branches: {
          some: {
            id: branchId,
          },
        },
      },
      select: EMPLOYEE_GROUP_SELECT,
    });

    if (!employeeGroup)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 findByIdWithBranch - Nhóm nhân viên không tồn tại!',
      );

    return employeeGroup;
  }
}
