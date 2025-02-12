import { FindManyDto } from './../../utils/Common.dto';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateEmployeeGroupDto, UpdateEmployeeGroupDto } from "./dto/employee-group.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { customPaginate, removeDiacritics } from "utils/Helps";
import { DeleteManyDto } from "utils/Common.dto";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";
import { ACCOUNT_TYPE } from 'enums/user.enum';

@Injectable()
export class EmployeeGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async create(data: CreateEmployeeGroupDto, tokenPayload: TokenPayload) {
    const employeeGroup = await this.prisma.employeeGroup.create({
      data: {
        name: data.name,
        description: data.description,
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });

    await this.commonService.createActivityLog(
      [employeeGroup.id],
      "EmployeeGroup",
      ACTIVITY_LOG_TYPE.CREATE,
      tokenPayload,
    );

    return employeeGroup;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { page, perPage, keyword, orderBy } = params;

    let where: Prisma.EmployeeGroupWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
    };

    return await customPaginate(
      this.prisma.employeeGroup,
      {
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          updatedAt: true,
          _count: {
            select: {
              users: {
                where: {
                  isPublic: true,
                  account: {
                    type: ACCOUNT_TYPE.STAFF
                  }
                }
              }
            }
          }
        },
      },
      {
        page,
        perPage,
      },
    );

  }

  async findUniq(where: Prisma.EmployeeGroupWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.employeeGroup.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        description: true
      },
    });
  }

  async update(
    params: {
      where: Prisma.EmployeeGroupWhereUniqueInput;
      data: UpdateEmployeeGroupDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const employeeGroup = await this.prisma.employeeGroup.update({
      data: {
        name: data.name,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });

    await this.commonService.createActivityLog(
      [employeeGroup.id],
      "EmployeeGroup",
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload,
    );
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.employeeGroup.updateMany({
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

    await this.commonService.createActivityLog(data.ids, "EmployeeGroup", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
