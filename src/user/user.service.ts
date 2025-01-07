import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CheckUniqDto, CreateEmployeeDto, FindManyEmployeeDto, UpdateEmployeeDto } from "./dto/employee-dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { CommonService } from "src/common/common.service";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination, customPaginate } from "utils/Helps";
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from "enums/user.enum";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async createEmployee(data: CreateEmployeeDto, tokenPayload: TokenPayload) {
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

      await this.commonService.createActivityLog([user.id], "User", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

      return user;
    });
  }

  async findAllEmployee(params: FindManyEmployeeDto, tokenPayload: TokenPayload) {
    const { page, perPage, keyword, employeeGroupIds, orderBy } = params;

    const keySearch = ["name", "code", "email", "phone"];

    const where: Prisma.UserWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
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

    return await customPaginate(
      this.prisma.user,
      {
        orderBy: orderBy || { createdAt: "desc" },
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
          updatedAt: true,
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
              permissions: {
                where: { isPublic: true },
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      {
        page,
        perPage,
      },
    );
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
      include: {
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
            permissions: {
              where: { isPublic: true },
            },
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

    const result = await this.prisma.user.update({
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
            ...(data.newPassword && { password: bcrypt.hashSync(data.newPassword, 10) }),
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

    await this.commonService.createActivityLog([result.id], "User", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async deleteManyEmployee(data: DeleteManyDto, tokenPayload: TokenPayload) {
    await this.prisma.account.updateMany({
      where: {
        isPublic: true,
        user: {
          id: { in: data.ids },
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    const count = await this.prisma.user.updateMany({
      where: {
        id: { in: data.ids },
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(data.ids, "User", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }

  async checkUniq(data: CheckUniqDto) {
    const { field, id, value } = data;

    let record = null;

    if (field === "username") {
      record = await this.prisma.account.findFirst({
        where: {
          username: value,
          user: { id: { not: id } },
        },
      });
    } else {
      record = await this.prisma.user.findFirst({
        where: {
          [field]: value,
          id: { not: id },
        },
      });
    }

    return record === null;
  }
}
