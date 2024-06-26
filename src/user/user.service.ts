import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateEmployeeDto } from './dto/create-employee-dto';
import { AnyObject, TokenPayload } from 'interfaces/common.interface';
import { CustomHttpException } from 'utils/ApiErrors';
import { CommonService } from 'src/common/common.service';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async checkUserExisting<T extends AnyObject>(
    data: T,
    shopId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma.user.findFirst({
      where: {
        isPublic: true,
        OR: Object.keys(data).map((key) => ({
          [key]: { equals: data[key], mode: 'insensitive' },
        })),
        accounts: {
          some: {
            branches: {
              some: {
                shopId: shopId,
              },
            },
          },
        },
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(
        (key) => result[key] === data[key],
      );

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkUserExisting - Dữ liệu đã tồn tại!',
        conflictingKeys.map((key) => ({ [key]: 'Dữ liệu đã được sử dụng!' })),
      );
    }
  }

  async checkAccountExisting<T extends AnyObject>(
    data: T,
    shopId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        OR: Object.keys(data).map((key) => ({
          [key]: { equals: data[key], mode: 'insensitive' },
        })),
        branches: {
          some: {
            shopId: shopId,
          },
        },
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(
        (key) => result[key] === data[key],
      );

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkAccountExisting - Dữ liệu đã tồn tại!',
        conflictingKeys.map((key) => ({ [key]: 'Dữ liệu đã được sử dụng!' })),
      );
    }
  }

  async createEmployee(data: CreateEmployeeDto, tokenPayload: TokenPayload) {
    await this.checkUserExisting(
      { phone: data.phone, email: data.email },
      tokenPayload.shopId,
    );

    await this.checkAccountExisting(
      { username: data.username },
      tokenPayload.shopId,
    );

    await this.checkUserExisting({ phone: data.username }, tokenPayload.shopId);

    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
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
        },
      });

      await prisma.account.create({
        data: {
          username: data.username,
          password: bcrypt.hashSync(data.password, 10),
          status: ACCOUNT_STATUS.ACTIVE,
          type: ACCOUNT_TYPE.STAFF,
          user: {
            connect: {
              id: user.id,
            },
          },
          branches: {
            connect: {
              id: tokenPayload.branchId,
            },
          },
        },
      });
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, employeeGroupIds } = params;

    const keySearch = ['name', 'code', 'email', 'phone'];

    const where: Prisma.UserWhereInput = {
      isPublic: true,
      // branches: {
      //   some: {
      //     isPublic: true,
      //     id: tokenPayload.branchId,
      //   },
      // },
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      ...(employeeGroupIds?.length > 0 && {
        employeeGroup: {
          id: { in: employeeGroupIds },
          isPublic: true,
          // branches: {
          // some: {
          //   id: tokenPayload.branchId,
          //   isPublic: true,
          // },
          // },
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
              // branches: {
              // some: {
              //   id: tokenPayload.branchId,
              //   isPublic: true,
              // },
              // },
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
        // branches: {
        //   some: {
        //     id: tokenPayload.branchId,
        //     isPublic: true,
        //   },
        // },
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
        startDate: true,
        photoURL: true,
        employeeGroup: {
          select: {
            id: true,
            name: true,
          },
          where: {
            // branches: {
            //   some: {
            //     id: tokenPayload.branchId,
            //     isPublic: true,
            //   },
            // },
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: CreateEmployeeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

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
        // branches: {
        //   some: {
        //     id: tokenPayload.branchId,
        //     isPublic: true,
        //   },
        // },
      },
    });
  }

  async removeMany(where: Prisma.UserWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.user.updateMany({
      where: {
        ...where,
        isPublic: true,
        // branches: {
        //   some: {
        //     isPublic: true,
        //     id: tokenPayload.branchId,
        //   },
        // },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
