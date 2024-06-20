import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination, generateUniqueId } from 'utils/Helps';
import { CreateProductDto } from './dto/create-product.dto';
import { CommonService } from 'src/common/common.service';
import { FindManyProductDto } from './dto/find-many.dto';
import * as slug from 'slug';
@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateProductDto, tokenPayload: TokenPayload) {
    // : Promise<Prisma.ProductCreateInput>

    return this.prisma.product.create({
      data: {
        slug: slug(`${data.name}-${Math.floor(Date.now() / 1000)}`),
        name: data.name,
        sku: data.sku,
        code: data.code,
        price: data.price,
        description: data.description,
        otherAttributes: data.otherAttributes,
        isCombo: data.isCombo,
        status: data.status,
        isInitialStock: data.isInitialStock,
        photoURLs: data.photoURLs,
        productType: {
          connect: {
            id: data.productTypeId,
          },
        },
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        measurementUnit: {
          connect: {
            id: data.unitId,
          },
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyProductDto) {
    // let {
    //   skip,
    //   take,
    //   keyword,
    //   productTypeIds,
    //   measurementUnitIds,
    //   statuses,
    //   isCombo,
    //   branchId,
    // } = params;
    // const keySearch = ['name', 'code', 'sku'];
    // let where: Prisma.ProductWhereInput = {
    //   isPublic: true,
    //   branchId,
    //   ...(keyword && {
    //     OR: keySearch.map((key) => ({
    //       [key]: { contains: keyword, mode: 'insensitive' },
    //     })),
    //   }),
    //   ...(productTypeIds?.length > 0 && {
    //     productType: {
    //       id: { in: productTypeIds },
    //       isPublic: true,
    //       branchId,
    //     },
    //   }),
    //   ...(measurementUnitIds?.length > 0 && {
    //     measurementUnit: {
    //       id: { in: measurementUnitIds },
    //       isPublic: true,
    //       branches: {
    //         some: {
    //           id: branchId,
    //         },
    //       },
    //     },
    //   }),
    //   ...(statuses && { status: { in: statuses } }),
    //   ...(isCombo && { isCombo }),
    //   status: { in: statuses },
    // };
    // const [data, totalRecords] = await Promise.all([
    //   this.prisma.product.findMany({
    //     skip,
    //     take,
    //     orderBy: {
    //       createdAt: 'desc',
    //     },
    //     where,
    //     select: {
    //       id: true,
    //       identifier: true,
    //       branchId: true,
    //       unitId: true,
    //       name: true,
    //       sku: true,
    //       code: true,
    //       price: true,
    //       description: true,
    //       photoURLs: true,
    //       otherAttributes: true,
    //       isCombo: true,
    //       status: true,
    //       isInitialStock: true,
    //       slug: true,
    //       measurementUnit: {
    //         select: {
    //           id: true,
    //           name: true,
    //           code: true,
    //         },
    //       },
    //       productType: {
    //         select: {
    //           id: true,
    //           name: true,
    //         },
    //       },
    //     },
    //   }),
    //   this.prisma.product.count({
    //     where,
    //   }),
    // ]);
    // return {
    //   list: data,
    //   pagination: calculatePagination(totalRecords, skip, take),
    // };
  }

  async findUniq(where: Prisma.ProductWhereInput) {
    return this.prisma.product.findFirst({
      where: {
        ...where,
        isPublic: true,
      },
      select: {
        id: true,
        branchId: true,
        unitId: true,
        name: true,
        sku: true,
        code: true,
        price: true,
        description: true,
        photoURLs: true,
        otherAttributes: true,
        isCombo: true,
        status: true,
        isInitialStock: true,
        slug: true,
        measurementUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductWhereInput;
      data: CreateProductDto;
    },
    tokenPayload: TokenPayload,
  ) {
    // const { where, data } = params;
    // return this.prisma.product.updateMany({
    //   where: {
    //     ...where,
    //     isPublic: true,
    //     branch: {
    //       id: {
    //         in: data.branchIds,
    //       },
    //     },
    //   },
    //   data: {
    //     name: data.name,
    //     description: data.description,
    //     unitId: data.unitId,
    //     productTypeId: data.productTypeId,
    //     sku: data.sku,
    //     code: data.code,
    //     price: data.price,
    //     photoURLs: data.photoURLs,
    //     otherAttributes: data.otherAttributes,
    //     isCombo: data.isCombo,
    //     status: data.status,
    //     isInitialStock: data.isInitialStock,
    //     updatedBy: tokenPayload.accountId,
    //   },
    // });
  }

  async removeMany(
    where: Prisma.ProductWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.product.updateMany({
      where: {
        ...where,
        isPublic: true,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
