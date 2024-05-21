import { HttpStatus, Injectable } from '@nestjs/common';
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

  async findUserByCondition(where: any, shopId: number) {
    return await this.prisma.user.findFirst({
      where: {
        isPublic: true,
        shops: {
          some: {
            id: shopId,
          },
        },
        ...where,
      },
    });
  }
}
