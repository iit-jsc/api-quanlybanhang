import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDTO } from './dto/create-employee-dto';
import { EmployeeGroupService } from 'src/employee-group/employee-group.service';
import { TokenPayload } from 'interfaces/common.interface';
import { CustomHttpException } from 'utils/ApiErrors';
import { USER_TYPE } from 'enums/user.enum';
import { PermissionService } from 'src/permission/permission.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employeeGroupService: EmployeeGroupService,
  ) {}

  async create(data: CreateEmployeeDTO, tokenPayload: TokenPayload) {
    if (data.employeeGroupId)
      await this.employeeGroupService.findByIdWithBranch(
        data.employeeGroupId,
        tokenPayload.branchId,
      );

    // if (data.permissionId)
    // await this.permissionService.findByIdWithBranch(
    //   data.employeeGroupId,
    //   tokenPayload.branchId,
    // );

    // await this.prisma.user.create({
    //   data: {
    //     name: data.name,
    //     phone: data.phone,
    //     email: data.email,
    //     sex: data.sex,
    //     birthday: data.birthday,
    //     cardDate: data.cardDate,
    //     startDate: data.startDate,
    //     type: USER_TYPE.STAFF,
    //     employeeGroupId: data.employeeGroupId,
    //     photoURL: data.photoURL,
    //     address: data.address,
    //     cardId: data.cardId,
    //     cardAddress: data.cardAddress,
    //     createdBy: tokenPayload.accountId,
    //     updatedBy: tokenPayload.accountId,
    //     detailPermissions: {
    //       create: {
    //         branchId: tokenPayload.branchId,
    //       },
    //     },
    //   },
    // });
  }

  async getByAccountId(id: number) {
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

  async findByPhoneWithType(phone: string, type: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        type,
        phone,
      },
    });
  }
}
