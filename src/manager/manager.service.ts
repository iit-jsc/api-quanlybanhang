import * as bcrypt from "bcrypt";
import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateManagerDto, FindManyManagerDto, UpdateManagerDto } from "./dto/manager.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from "enums/user.enum";
import { customPaginate } from "utils/Helps";
import { CustomHttpException } from "utils/ApiErrors";

@Injectable()
export class ManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

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
    // Kiểm tra chi nhánh thuộc shop không
    await this.checkBranchesInShop(data.branchIds, tokenPayload.shopId);

    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          code: data.code,
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
          username: data.username,
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

    return this.prisma.user.update({
      data: {
        name: data.name,
        phone: data.phone,
        code: data.code,
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

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma) => {
      const count = await prisma.user.updateMany({
        where: {
          id: {
            in: data.ids,
          },
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
      });

      await prisma.account.updateMany({
        where: {
          user: {
            id: {
              in: data.ids,
            },
          },
          isPublic: true,
        },
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        },
      });

      return {
        ...count,
        ids: data.ids,
      } as DeleteManyResponse;
    });
  }

  async findAll(params: FindManyManagerDto, tokenPayload: TokenPayload) {
    const { page, perPage, keyword, orderBy, branchIds } = params;

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
        ...(branchIds?.length > 0 && {
          branches: {
            some: {
              id: { in: branchIds },
            },
          },
        }),
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
          account: {
            select: {
              type: true,
              username: true,
              status: true,
              branches: {
                where: {
                  isPublic: true,
                },
                select: {
                  id: true,
                  name: true,
                  photoURL: true,
                },
              },
            },
          },
          updatedAt: true,
        },
      },
      {
        page,
        perPage,
      },
    );

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
            branches: {
              where: {
                isPublic: true,
              },
              select: {
                id: true,
                name: true,
                photoURL: true,
              },
            },
          },
        },
      },
    });
  }
}
