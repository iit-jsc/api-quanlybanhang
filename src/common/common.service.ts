import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EMPLOYEE_GROUP_SELECT } from 'enums/select.enum';
import { PrismaService } from 'nestjs-prisma';
import { permission } from 'process';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByAccountId(id: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        accounts: {
          some: {
            id,
          },
        },
      },
    });
  }

  async findEmployeeByIdWithBranch(id: number, branchId: number) {
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
        '#1 findEmployeeByIdWithBranch - Nhóm nhân viên không tồn tại!',
      );

    return employeeGroup;
  }

  async findPermissionByIdWithBranch(id: number, branchId: number) {
    const permission = await this.prisma.permission.findUnique({
      where: {
        id: +id,
        isPublic: true,
        branches: {
          some: {
            id: branchId,
          },
        },
      },
    });

    if (!permission)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 findPermissionByIdWithBranch - Nhóm quyền không tồn tại!',
      );

    return permission;
  }

  async findUserByCondition(where: any) {
    return await this.prisma.user.findFirst({
      where: {
        isPublic: true,
        ...where,
      },
    });
  }

  async findManyShopByUserId(id: number) {
    return await this.prisma.shop.findMany({
      where: {
        isPublic: true,
        branches: {
          some: {
            isPublic: true,
            users: {
              some: {
                id,
                isPublic: true,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        photoURL: true,
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            photoURL: true,
          },
          where: {
            isPublic: true,
            users: {
              some: {
                id,
                isPublic: true,
              },
            },
          },
        },
        businessType: {
          where: {
            isPublic: true,
          },
        },
      },
    });
  }

  async findShopByCondition(where: Prisma.ShopWhereInput) {
    return await this.prisma.shop.findFirst({
      where: {
        isPublic: true,
        ...where,
      },
    });
  }

  async findUserByPhoneWithType(phone: string, type: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        phone,
        accounts: {
          some: {
            type,
          },
        },
      },
    });
  }

  async findByIdWithBranches(
    id: number,
    model: Prisma.ModelName,
    branchId: number,
  ) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        isPublic: true,
        id,
        branches: {
          some: {
            isPublic: true,
            id: branchId,
          },
        },
      },
    });
  }

  async findByIdWithBranch(
    id: number,
    model: Prisma.ModelName,
    branchId: number,
  ) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        isPublic: true,
        id,
        branchId: branchId,
      },
    });
  }

  async findByIdWithShop(id: number, model: Prisma.ModelName, shopId: number) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        isPublic: true,
        id,
        shop: {
          id: shopId,
          isPublic: true,
        },
      },
    });
  }
}
