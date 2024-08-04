import { Injectable } from "@nestjs/common";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/customer.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateCustomerDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInShop(
      { phone: data.phone, email: data.email },
      "Customer",
      tokenPayload.shopId,
    );

    if (data.customerTypeId)
      await this.commonService.findByIdWithShop(data.customerTypeId, "CustomerType", tokenPayload.shopId);

    return await this.prisma.customer.create({
      data: {
        name: data.name,
        endow: data.endow,
        phone: data.phone,
        address: data.address,
        birthDay: data.birthDay,
        ...(data.customerTypeId && {
          customerType: {
            connect: {
              id: data.customerTypeId,
            },
          },
        }),
        description: data.description,
        discount: data.discount,
        discountType: data.discountType,
        email: data.email,
        fax: data.fax,
        tax: data.tax,
        sex: data.sex,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        shop: {
          connect: {
            id: tokenPayload.shopId,
            isPublic: true,
          },
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, customerTypeIds, from, to, orderBy } = params;

    const keySearch = ["name", "code", "email", "phone"];

    const where: Prisma.CustomerWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
      ...(customerTypeIds?.length > 0 && {
        customerType: {
          id: { in: customerTypeIds },
          isPublic: true,
          shopId: tokenPayload.shopId,
        },
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: from,
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          name: true,
          endow: true,
          phone: true,
          address: true,
          birthDay: true,
          customerType: {
            select: {
              id: true,
              name: true,
              description: true,
              discount: true,
              discountType: true,
            },
          },
          description: true,
          discount: true,
          discountType: true,
          email: true,
          fax: true,
          tax: true,
          sex: true,
          representativeName: true,
          representativePhone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.customer.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.CustomerWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.customer.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      select: {
        id: true,
        name: true,
        endow: true,
        phone: true,
        address: true,
        birthDay: true,
        customerType: {
          select: {
            id: true,
            name: true,
            description: true,
            discount: true,
            discountType: true,
          },
        },
        description: true,
        discount: true,
        discountType: true,
        email: true,
        fax: true,
        tax: true,
        sex: true,
        representativeName: true,
        representativePhone: true,
        createdAt: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.CustomerWhereUniqueInput;
      data: UpdateCustomerDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.commonService.checkDataExistingInShop(
      { phone: data.phone, email: data.email },
      "Customer",
      tokenPayload.shopId,
      where.id,
    );

    if (data.customerTypeId)
      await this.commonService.findByIdWithShop(data.customerTypeId, "CustomerType", tokenPayload.shopId);

    return this.prisma.customer.update({
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      data: {
        name: data.name,
        endow: data.endow,
        phone: data.phone,
        address: data.address,
        birthDay: data.birthDay,
        description: data.description,
        discount: data.discount,
        discountType: data.discountType,
        email: data.email,
        fax: data.fax,
        tax: data.tax,
        sex: data.sex,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        ...(data.customerTypeId && {
          customerType: {
            connect: {
              id: data.customerTypeId,
            },
          },
        }),
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.customer.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
