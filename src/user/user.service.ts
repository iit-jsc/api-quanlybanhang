import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateEmployeeDto, UpdateEmployeeDto } from "./dto/employee-dto";
import { TokenPayload } from "interfaces/common.interface";
import { CommonService } from "src/common/common.service";
import { Prisma } from "@prisma/client";
import { FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from "enums/user.enum";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async createEmployee(data: CreateEmployeeDto, tokenPayload: TokenPayload) {
    await this.commonService.checkUserExisting(
      { phone: data.phone, email: data.email, code: data.code },
      tokenPayload.shopId,
    );

    await this.commonService.checkAccountExisting({ username: data.username }, tokenPayload.shopId);

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
          branchId: tokenPayload.branchId,
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
          permissions: {
            connect: data.permissionIds?.map((id) => ({ id })),
          },
        },
      });

      return user;
    });
  }

  async findAllEmployee(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, employeeGroupIds } = params;

    const keySearch = ["name", "code", "email", "phone"];

    const where: Prisma.UserWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
      ...(employeeGroupIds?.length > 0 && {
        employeeGroup: {
          id: { in: employeeGroupIds },
          isPublic: true,
        },
      }),
      account: {
        type: ACCOUNT_TYPE.STAFF,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
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
            },
          },
          account: {
            select: {
              type: true,
              username: true,
              status: true,
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

  async findUniqEmployee(where: Prisma.UserWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
        account: {
          type: ACCOUNT_TYPE.STAFF,
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
        startDate: true,
        photoURL: true,
        employeeGroup: {
          select: {
            id: true,
            name: true,
          },
          where: {
            isPublic: true,
          },
        },
        account: {
          select: {
            type: true,
            username: true,
            status: true,
          },
        },
      },
    });
  }

  async updateEmployee(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: UpdateEmployeeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    if (!data.phone || data.email)
      await this.commonService.checkUserExisting(
        { phone: data.phone, email: data.email, code: data.code },
        tokenPayload.shopId,
        where.id,
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
        account: {
          update: {
            status: data.accountStatus,
            ...(data.accountStatus && { password: bcrypt.hashSync(data.newPassword, 10) }),
            ...(data.permissionIds && {
              permissions: {
                set: data.permissionIds?.map((id) => ({ id })),
              },
            }),
          },
        },
      },
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async deleteManyEmployee(where: Prisma.UserWhereInput, tokenPayload: TokenPayload) {
    await this.prisma.account.updateMany({
      where: {
        isPublic: true,
        user: {
          ...where,
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return this.prisma.user.updateMany({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
