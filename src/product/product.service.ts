import { Injectable } from '@nestjs/common';
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
    const identifier = generateUniqueId();

    await this.commonService.findByIdWithBranches(
      data.unitId,
      'MeasurementUnit',
      tokenPayload.branchId,
    );

    const products = data.branchIds.map((id, index) => ({
      identifier,
      slug: slug(`${data.name}-${Math.floor(Date.now() / 1000)}${index}`),
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
      branch: {
        connect: {
          id: id,
        },
      },
      measurementUnit: {
        connect: {
          id: data.unitId,
        },
      },
      productToProductTypes: {
        createMany: {
          data: data.productTypeIds.map((id) => ({
            productTypeIdentifier: '123123',
            productTypeId: 1,
          })),
        },
      },
      createdBy: tokenPayload.accountId,
      updatedBy: tokenPayload.accountId,
    })) as Prisma.ProductCreateInput[];
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
        identifier: true,
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
