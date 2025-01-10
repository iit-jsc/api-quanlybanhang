import { Injectable } from "@nestjs/common";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreatePermissionDto, FindManyPermissionDto, UpdatePermissionDto } from "./dto/permission.dto";
import { customPaginate } from "utils/Helps";
import { Prisma } from "@prisma/client";
import { DeleteManyDto } from "utils/Common.dto";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreatePermissionDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        ...(data.roleCodes && {
          roles: {
            connect: data.roleCodes.map((code) => ({
              code,
            })),
          },
        }),
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
      include: {
        roles: true,
      },
    });

    await this.commonService.createActivityLog([result.id], "Permission", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyPermissionDto, tokenPayload: TokenPayload) {
    let { page, perPage, keyword, orderBy } = params;

    const where: Prisma.PermissionWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword } }),
    };

    return await customPaginate(
      this.prisma.permission,
      {
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          branch: {
            select: {
              id: true,
              photoURL: true,
              name: true,
              address: true,
              createdAt: true,
            },
            where: { isPublic: true },
          },
          roles: {
            select: {
              name: true,
              code: true,
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

  async update(
    params: {
      where: Prisma.PermissionWhereUniqueInput;
      data: UpdatePermissionDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const result = await this.prisma.permission.update({
      data: {
        name: data.name,
        description: data.description,
        ...(data.roleCodes && {
          roles: {
            set: data.roleCodes.map((code) => ({
              code,
            })),
          },
        }),
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });

    await this.commonService.createActivityLog([result.id], "Permission", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async findUniq(where: Prisma.PermissionWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.permission.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        branch: {
          select: {
            id: true,
            photoURL: true,
            name: true,
            address: true,
            createdAt: true,
          },
          where: { isPublic: true },
        },
        roles: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.permission.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(data.ids, "Permission", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
