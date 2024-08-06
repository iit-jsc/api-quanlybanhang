import * as bcrypt from "bcrypt";
import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateManagerDto, UpdateManagerDto } from "./dto/manager.dto";
import { TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { FindManyDto } from "utils/Common.dto";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from "enums/user.enum";
import { calculatePagination } from "utils/Helps";
import { CustomHttpException } from "utils/ApiErrors";

@Injectable()
export class ManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async checkManagerExisting(username: string, id?: string) {
    let ownerShopAccount = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        OR: [{ type: ACCOUNT_TYPE.MANAGER }, { type: ACCOUNT_TYPE.STORE_OWNER }],
        username: {
          equals: username?.trim(),
        },
        user: {
          id: {
            not: id,
          },
        },
      },
    });

    if (ownerShopAccount) throw new CustomHttpException(HttpStatus.CONFLICT, "Tài khoản đã tồn tại!");
  }

  async checkBranchesInShop(branchIds: string[], shopId: string) {
    const invalidBranch = await this.prisma.branch.findFirst({
      where: {
        id: {
          in: branchIds,
        },
        shopId: {
          not: shopId,
        },
        isPublic: true,
      },
    });

    if (invalidBranch) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Chi nhánh không tồn tại!");
  }

  async create(data: CreateManagerDto, tokenPayload: TokenPayload) {
    await this.checkManagerExisting(data.phone);

    // Kiểm tra chi nhánh thuộc shop không
    await this.checkBranchesInShop(data.branchIds, tokenPayload.shopId);

    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          sex: data.sex,
          birthday: data.birthday,
          cardDate: data.cardDate,
          startDate: data.startDate,
          photoURL: data.photoURL,
          address: data.address,
          cardId: data.cardId,
          cardAddress: data.cardAddress,
          createdBy: tokenPayload.accountId,
        },
      });

      await prisma.account.create({
        data: {
          username: data.phone,
          password: bcrypt.hashSync(data.password, 10),
          status: ACCOUNT_STATUS.ACTIVE,
          type: ACCOUNT_TYPE.MANAGER,
          user: {
            connect: {
              id: user.id,
            },
          },
          branches: { connect: data.branchIds?.map((id: string) => ({ id })) },
        },
      });

      return user;
    });
  }

  async update(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: UpdateManagerDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    // Kiểm tra chi nhánh thuộc shop không
    if (data.branchIds && data.branchIds?.length > 0)
      await this.checkBranchesInShop(data.branchIds, tokenPayload.shopId);

    await this.checkManagerExisting(data.phone, where.id);

    return this.prisma.user.update({
      data: {
        name: data.name,
        // phone: data.phone,
        email: data.email,
        sex: data.sex,
        birthday: data.birthday,
        cardDate: data.cardDate,
        startDate: data.startDate,
        photoURL: data.photoURL,
        address: data.address,
        cardId: data.cardId,
        cardAddress: data.cardAddress,
        updatedBy: tokenPayload.accountId,
        account: {
          update: {
            status: data.accountStatus,
            ...(data.newPassword && { password: data.newPassword ? bcrypt.hashSync(data.newPassword, 10) : undefined }),
            ...(data.branchIds &&
              data.branchIds?.length > 0 && {
                branches: {
                  set: data.branchIds?.map((id: string) => ({ id })),
                },
              }),
          },
        },
      },
      where: {
        id: where.id,
        isPublic: true,
        account: {
          branches: {
            some: {
              shopId: tokenPayload.shopId,
            },
          },
        },
      },
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.update({
        where: {
          ...where,
          account: {
            branches: {
              some: {
                shopId: tokenPayload.shopId,
              },
            },
          },
          isPublic: true,
        },
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        },
        select: {
          account: true,
        },
      });

      await prisma.account.update({
        where: {
          userId: where.id,
          isPublic: true,
        },
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        },
      });
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, orderBy } = params;

    const keySearch = ["name", "code", "email", "phone"];

    const where: Prisma.UserWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
      account: {
        type: ACCOUNT_TYPE.MANAGER,
        branches: {
          some: {
            shopId: tokenPayload.shopId,
          },
        },
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
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
          account: {
            select: {
              type: true,
              username: true,
              status: true,
            },
          },
          updatedAt: true,
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

  async findUniq(where: Prisma.UserWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        account: {
          type: ACCOUNT_TYPE.MANAGER,
          branches: {
            some: {
              shopId: tokenPayload.shopId,
            },
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
        startDate: true,
        photoURL: true,
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
}
