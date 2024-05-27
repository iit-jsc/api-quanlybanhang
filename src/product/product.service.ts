import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination, generateUniqueId } from 'utils/Helps';
import { CreateProductDto } from './dto/create-product.dto';
import { CommonService } from 'src/common/common.service';

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

    await this.commonService.findByIdWithBranch(
      data.productTypeId,
      'ProductType',
      tokenPayload.branchId,
    );

    const products = data.branchIds.map((id) => ({
      identifier,
      name: data.name,
      description: data.description,
      branchId: id,
      unitId: data.unitId,
      productTypeId: data.productTypeId,
      sku: data.sku,
      code: data.code,
      retailPrice: data.retailPrice,
      wholesalePrice: data.wholesalePrice,
      importPrice: data.importPrice,
      photoURLs: data.photoURLs,
      otherAttributes: data.otherAttributes,
      isCombo: data.isCombo,
      status: data.status,
      isInitialStock: data.isInitialStock,
      createdBy: tokenPayload.accountId,
      updatedBy: tokenPayload.accountId,
    })) as Prisma.ProductCreateManyInput[];
    return await this.prisma.product.createMany({
      data: products,
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let {
      skip,
      take,
      keyword,
      productTypeIds,
      measurementUnitIds,
      statuses,
      isCombo,
    } = params;

    const keySearch = ['name', 'code', 'sku'];

    let where: Prisma.ProductWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      ...(productTypeIds?.length > 0 && {
        productType: {
          id: { in: productTypeIds },
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      }),
      ...(measurementUnitIds?.length > 0 && {
        measurementUnit: {
          id: { in: measurementUnitIds },
          isPublic: true,
          branches: {
            some: {
              id: tokenPayload.branchId,
            },
          },
        },
      }),
      ...(statuses && { status: { in: statuses } }),
      ...(isCombo && { isCombo }),
      status: { in: statuses },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          identifier: true,
          branchId: true,
          unitId: true,
          name: true,
          sku: true,
          code: true,
          retailPrice: true,
          wholesalePrice: true,
          importPrice: true,
          description: true,
          photoURLs: true,
          otherAttributes: true,
          isCombo: true,
          status: true,
          isInitialStock: true,
          measurementUnit: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          productType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.product.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.ProductWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.product.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        identifier: true,
        branchId: true,
        unitId: true,
        name: true,
        sku: true,
        code: true,
        retailPrice: true,
        wholesalePrice: true,
        importPrice: true,
        description: true,
        photoURLs: true,
        otherAttributes: true,
        isCombo: true,
        status: true,
        isInitialStock: true,
        measurementUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        productType: {
          select: {
            id: true,
            name: true,
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
    const { where, data } = params;
    return this.prisma.product.updateMany({
      where: {
        ...where,
        isPublic: true,
        branch: {
          id: {
            in: data.branchIds,
          },
        },
      },
      data: {
        name: data.name,
        description: data.description,
        unitId: data.unitId,
        productTypeId: data.productTypeId,
        sku: data.sku,
        code: data.code,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        importPrice: data.importPrice,
        photoURLs: data.photoURLs,
        otherAttributes: data.otherAttributes,
        isCombo: data.isCombo,
        status: data.status,
        isInitialStock: data.isInitialStock,
        updatedBy: tokenPayload.accountId,
      },
    });
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
