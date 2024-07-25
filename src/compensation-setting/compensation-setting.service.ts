import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { CompensationEmployee, Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";
import { CreateCompensationSettingDto, UpdateCompensationSettingDto } from "./dto/compensation-setting.dto";
import { CommonService } from "src/common/common.service";
import { ACCOUNT_TYPE } from "enums/user.enum";

@Injectable()
export class CompensationSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async create(data: CreateCompensationSettingDto, tokenPayload: TokenPayload) {
    const employeeIds = await this.commonService.findAllIdsInBranch("User", tokenPayload.branchId, {
      account: {
        type: ACCOUNT_TYPE.STAFF,
      },
    });

    return await this.prisma.$transaction(async (prisma) => {
      const compensationSetting = await this.prisma.compensationSetting.create({
        data: {
          name: data.name,
          description: data.description,
          defaultValue: data.defaultValue,
          type: data.type,
          branchId: tokenPayload.branchId,
          createdBy: tokenPayload.accountId,
        },
      });

      const compensationEmployeeData = employeeIds.map((employeeId: string) => ({
        employeeId,
        compensationSettingId: compensationSetting.id,
        type: data.type,
        value: data.defaultValue,
        createdBy: tokenPayload.accountId,
        branchId: tokenPayload.branchId,
      })) as Prisma.CompensationEmployeeCreateManyInput[];

      await prisma.compensationEmployee.createMany({ data: compensationEmployeeData, skipDuplicates: true });

      return compensationSetting;
    });
  }

  // async update(
  //   params: {
  //     where: Prisma.CompensationSettingWhereUniqueInput;
  //     data: UpdateCompensationSettingDto;
  //   },
  //   tokenPayload: TokenPayload,
  // ) {
  //   const { where, data } = params;

  //   return await this.prisma.$transaction(async (prisma) => {
  //     const employeeIds = await this.commonService.findAllIdsInBranch("User", tokenPayload.branchId, {
  //       account: {
  //         type: ACCOUNT_TYPE.STAFF,
  //       },
  //     });

  //     const compensationEmployeeData = employeeIds.map(async (employeeId: string) => {
  //       return prisma.compensationEmployee.upsert({
  //         where: {
  //           compensationSettingId_employeeId: {
  //             employeeId,
  //             compensationSettingId: where.id,
  //           },
  //         },
  //         create: {
  //           employeeId,
  //           compensationSettingId: where.id,
  //           type: data.type,
  //           value: data.defaultValue,
  //           createdBy: tokenPayload.accountId,
  //           branchId: tokenPayload.branchId,
  //         },
  //         update: {
  //           value: data.defaultValue,
  //           updatedBy: tokenPayload.accountId,
  //         },
  //       });
  //     });

  //     await Promise.all(compensationEmployeeData);

  //     return await prisma.compensationSetting.update({
  //       where: {
  //         id: where.id,
  //         branchId: tokenPayload.branchId,
  //         isPublic: true,
  //       },
  //       data: {
  //         name: data.name,
  //         description: data.description,
  //         type: data.type,
  //         defaultValue: data.defaultValue,
  //         updatedBy: tokenPayload.accountId,
  //       },
  //     });
  //   });
  // }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, types } = params;

    const keySearch = ["name"];

    const where: Prisma.CompensationSettingWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
      ...(types && { type: { in: types } }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.compensationSetting.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          updatedAt: true,
        },
      }),
      this.prisma.compensationSetting.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.CompensationSettingWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.compensationSetting.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma) => {
      await prisma.compensationEmployee.deleteMany({
        where: {
          branchId: tokenPayload.branchId,
          compensationSettingId: {
            in: data.ids,
          },
        },
      });

      const count = await prisma.compensationSetting.updateMany({
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

      return { ...count, ids: data.ids } as DeleteManyResponse;
    });
  }
}
