import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class SupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService
  ) {}

  // async create(data: CreateSupplierDto, tokenPayload: TokenPayload) {
  //   const result = await this.prisma.supplier.create({
  //     data: {
  //       name: data.name,
  //       phone: data.phone,
  //       email: data.email,
  //       address: data.address,
  //       note: data.note,
  //       representativeName: data.representativeName,
  //       representativePhone: data.representativePhone,
  //       supplierTypeId: data.supplierTypeId,
  //       createdBy: tokenPayload.accountId,
  //       branchId: tokenPayload.branchId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     [result.id],
  //     'Supplier',
  //     ACTIVITY_LOG_TYPE.CREATE,
  //     tokenPayload
  //   )

  //   return result
  // }

  // async update(
  //   params: {
  //     where: Prisma.SupplierWhereUniqueInput
  //     data: UpdateSupplierDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params

  //   const result = await this.prisma.supplier.update({
  //     where: { id: where.id, isPublic: true, branchId: tokenPayload.branchId },
  //     data: {
  //       name: data.name,
  //       phone: data.phone,
  //       email: data.email,
  //       address: data.address,
  //       note: data.note,
  //       representativeName: data.representativeName,
  //       representativePhone: data.representativePhone,
  //       supplierTypeId: data.supplierTypeId,
  //       branchId: tokenPayload.branchId,
  //       createdBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     [result.id],
  //     'Supplier',
  //     ACTIVITY_LOG_TYPE.UPDATE,
  //     tokenPayload
  //   )

  //   return result
  // }

  // async findAll(params: FindManySupplierDto, tokenPayload: TokenPayload) {
  //   let { page, perPage, keyword, orderBy, supplierTypeIds } = params

  //   const keySearch = ['name']

  //   let where: Prisma.SupplierWhereInput = {
  //     isPublic: true,
  //     branchId: tokenPayload.branchId,
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
  //     }),
  //     ...(supplierTypeIds?.length > 0 && {
  //       supplierType: {
  //         id: { in: supplierTypeIds }
  //       }
  //     })
  //   }

  //   return await customPaginate(
  //     this.prisma.supplier,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       select: {
  //         id: true,
  //         name: true,
  //         phone: true,
  //         email: true,
  //         address: true,
  //         note: true,
  //         representativeName: true,
  //         representativePhone: true,
  //         supplierType: {
  //           select: {
  //             id: true,
  //             name: true,
  //             description: true
  //           }
  //         },
  //         updatedAt: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // findUniq(where: Prisma.SupplierWhereUniqueInput, tokenPayload: TokenPayload) {
  //   return this.prisma.supplier.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //       branchId: tokenPayload.branchId
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       phone: true,
  //       email: true,
  //       address: true,
  //       note: true,
  //       representativeName: true,
  //       representativePhone: true,
  //       supplierType: {
  //         select: {
  //           id: true,
  //           name: true,
  //           description: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.supplier.updateMany({
  //     where: {
  //       id: {
  //         in: data.ids
  //       },
  //       isPublic: true,
  //       branchId: tokenPayload.branchId
  //     },
  //     data: {
  //       isPublic: false,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     data.ids,
  //     'Supplier',
  //     ACTIVITY_LOG_TYPE.DELETE,
  //     tokenPayload
  //   )

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }
}
