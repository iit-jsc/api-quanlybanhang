import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateEmployeeDTO } from './dto/create-employee-dto';
import { TokenPayload } from 'interfaces/common.interface';
import { CustomHttpException } from 'utils/ApiErrors';
import { CommonService } from 'src/common/common.service';
import { Prisma } from '@prisma/client';
import { FindManyDTO } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';
import { ACCOUNT_TYPE } from 'enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateEmployeeDTO, tokenPayload: TokenPayload) {
    await this.checkUserExisted(data, tokenPayload);

    await this.prisma.user.create({
      data: {
        name: data.name,
        code: data.code,
        phone: data.phone,
        email: data.email,
        sex: data.sex,
        birthday: data.birthday,
        cardDate: data.cardDate,
        startDate: data.startDate,
        employeeGroupId: data.employeeGroupId,
        photoURL: data.photoURL,
        address: data.address,
        cardId: data.cardId,
        cardAddress: data.cardAddress,
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
        accounts: {
          create: {
            password: bcrypt.hashSync(data.password || '', 10),
            status: data.status,
            createdBy: tokenPayload.accountId,
            updatedBy: tokenPayload.accountId,
            type: ACCOUNT_TYPE.STAFF,
          },
        },
        branches: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
      },
    });
  }

  async checkUserExisted(data: CreateEmployeeDTO, tokenPayload: TokenPayload) {
    const user = await this.commonService.findUserByCondition({
      OR: [
        { phone: data.phone },
        { email: data.email },
        {
          code: {
            equals: data.code,
            mode: 'insensitive',
          },
        },
      ],
      detailPermissions: {
        some: {
          branchId: tokenPayload.branchId,
        },
      },
    } as Prisma.UserWhereInput);

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
          ...(user.code?.toLocaleLowerCase() == data.code?.toLocaleLowerCase()
            ? [
                {
                  message: 'Mã nhân viên đã được sử dụng!',
                  property: 'code',
                },
              ]
            : []),
        ],
      );
    }

    return true;
  }

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    const { skip, take, keyword, employeeGroupIds } = params;

    const keySearch = ['name', 'code', 'email', 'phone'];

    const where: Prisma.UserWhereInput = {
      isPublic: true,
      branches: {
        some: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      ...(employeeGroupIds?.length > 0 && {
        employeeGroupId: {
          in: employeeGroupIds,
        },
      }),
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
          name: true,
          code: true,
          phone: true,
          email: true,
          address: true,
          cardId: true,
          cardDate: true,
          cardAddress: true,
          birthday: true,
          sex: true,
          startDate: true,
          photoURL: true,
          employeeGroup: {
            select: {
              id: true,
              name: true,
            },
            where: {
              isPublic: true,
              branches: {
                some: {
                  id: tokenPayload.branchId,
                  isPublic: true,
                },
              },
            },
          },
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
    where: Prisma.UserWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        phone: true,
        email: true,
        address: true,
        cardId: true,
        cardDate: true,
        cardAddress: true,
        birthday: true,
        sex: true,
        photoURL: true,
        startDate: true,
        employeeGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: CreateEmployeeDTO;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.checkUserExisted(
      { ...data, id: where.id } as CreateEmployeeDTO,
      tokenPayload,
    );

    return this.prisma.user.update({
      data: {
        name: data.name,
        code: data.code,
        phone: data.phone,
        email: data.email,
        sex: data.sex,
        birthday: data.birthday,
        cardDate: data.cardDate,
        startDate: data.startDate,
        employeeGroupId: data.employeeGroupId,
        photoURL: data.photoURL,
        address: data.address,
        cardId: data.cardId,
        cardAddress: data.cardAddress,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
      },
    });
  }

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
