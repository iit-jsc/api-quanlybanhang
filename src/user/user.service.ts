import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateEmployeeDTO } from './dto/create-employee-dto';
import { TokenPayload } from 'interfaces/common.interface';
import { CustomHttpException } from 'utils/ApiErrors';
import { CommonService } from 'src/common/common.service';
import { ACCOUNT_STATUS, USER_TYPE } from 'enums/user.enum';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { FindManyDTO } from 'utils/Common.dto';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { USER_SELECT } from 'enums/select.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateEmployeeDTO, tokenPayload: TokenPayload) {
    if (data.employeeGroupId)
      await this.commonService.findEmployeeByIdWithBranch(
        data.employeeGroupId,
        tokenPayload.branchId,
      );

    if (data.permissionId)
      await this.commonService.findPermissionByIdWithBranch(
        data.permissionId,
        tokenPayload.branchId,
      );

    await this.checkUserExisted(data, tokenPayload);

    await this.prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        sex: data.sex,
        birthday: data.birthday,
        cardDate: data.cardDate,
        startDate: data.startDate,
        type: USER_TYPE.STAFF,
        employeeGroupId: data.employeeGroupId,
        photoURL: data.photoURL,
        address: data.address,
        cardId: data.cardId,
        cardAddress: data.cardAddress,
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
        detailPermissions: {
          create: {
            branchId: tokenPayload.branchId,
            permissionId: data.permissionId,
          },
        },
        accounts: {
          create: {
            password: bcrypt.hashSync(data.password, 10),
            status: ACCOUNT_STATUS.ACTIVE,
            createdBy: tokenPayload.accountId,
            updatedBy: tokenPayload.accountId,
          },
        },
      },
    });
  }

  async checkUserExisted(data: CreateEmployeeDTO, tokenPayload: TokenPayload) {
    const user = await this.commonService.findUserByCondition(
      {
        OR: [{ phone: data.phone }, { email: data.email }],
      },
      tokenPayload.shopId,
    );

    if (user && user.id !== data.id) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkUserExisted - Nhân viên đã tồn tại trong cửa hàng!',
        [
          ...(user.phone === data.phone
            ? [
                {
                  message: 'Số điện thoại đã được sử dụng!',
                  property: 'phone',
                },
              ]
            : []),
          ...(user.email === data.email
            ? [
                {
                  message: 'Email đã được sử dụng!',
                  property: 'email',
                },
              ]
            : []),
        ],
      );
    }

    return true;
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

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    let where: Prisma.UserWhereInput = {
      isPublic: true,
      detailPermissions: {
        some: {
          branchId: tokenPayload.branchId,
        },
      },
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          code: true,
          type: true,
          phone: true,
          email: true,
          address: true,
          cardId: true,
          cardDate: true,
          cardAddress: true,
          birthday: true,
          sex: true,
          startDate: true,
          employeeGroup: true,
        },
      }),
      this.prisma.user.count({
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
  ) {}

  async update(
    params: {
      where: Prisma.BranchWhereUniqueInput;
      data: Prisma.BranchUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {}

  async removeMany(
    where: Prisma.BranchWhereInput,
    tokenPayload: TokenPayload,
  ) {}

  async updatePhotoURL(
    params: {
      where: Prisma.BranchWhereUniqueInput;
      data: Prisma.BranchUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {}
}
