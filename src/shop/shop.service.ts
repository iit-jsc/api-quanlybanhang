import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateShopDto, RegisterShopDto } from './dto/create-shop.dto'
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum'
import { CommonService } from 'src/common/common.service'
import { AuthService } from 'src/auth/auth.service'
import {
  AnyObject,
  DeleteManyResponse,
  TokenPayload
} from 'interfaces/common.interface'
import { Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import {
  DISCOUNT_TYPE,
  FEATURE_CODE,
  PAYMENT_METHOD_TYPE
} from 'enums/common.enum'
import { FindByCodeDto } from './dto/shop.dto'

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService
  ) {}

  // async registerShop(data: RegisterShopDto, req: AnyObject) {
  //   const { user, branch } = data

  //   const { newShop, accountId } = await this.prisma.$transaction(
  //     async (prisma: PrismaClient) => {
  //       const ownerShop = await prisma.user.create({
  //         data: {
  //           name: user.name,
  //           phone: user.phone,
  //           email: user.email,
  //           account: {
  //             create: {
  //               username: user.username,
  //               password: bcrypt.hashSync(data.user.password, 10),
  //               status: ACCOUNT_STATUS.ACTIVE,
  //               type: ACCOUNT_TYPE.STORE_OWNER
  //             }
  //           }
  //         },
  //         select: {
  //           id: true,
  //           account: true
  //         }
  //       })

  //       const shopCode = await this.generateShopCode()

  //       const newShop = await prisma.shop.create({
  //         data: {
  //           name: data.name,
  //           code: shopCode,
  //           businessType: {
  //             connect: {
  //               code: data.businessTypeCode
  //             }
  //           },
  //           branches: {
  //             create: {
  //               name: branch.name,
  //               address: branch.address,
  //               accounts: {
  //                 connect: {
  //                   id: ownerShop.account.id
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         select: {
  //           id: true,
  //           branches: true
  //         }
  //       })

  //       await this.createSampleData(newShop.branches[0].id, newShop.id, prisma)

  //       return { newShop, accountId: ownerShop.account.id }
  //     }
  //   )

  //   return
  // }

  // async create(data: CreateShopDto, tokenPayload: TokenPayload) {
  //   await this.prisma.$transaction(async (prisma: PrismaClient) => {
  //     const newShop = await prisma.shop.create({
  //       data: {
  //         code: await this.generateShopCode(),
  //         name: data.name,
  //         businessTypeCode: data.businessTypeCode,
  //         photoURL: data.photoURL,
  //         status: data.status,
  //         address: data.address,
  //         email: data.email,
  //         phone: data.phone,
  //         branches: {
  //           create: {
  //             name: data.branch?.name,
  //             address: data.branch?.address,
  //             photoURL: data.photoURL,
  //             accounts: {
  //               connect: {
  //                 id: tokenPayload.accountId
  //               }
  //             }
  //           }
  //         },
  //         createdBy: tokenPayload.accountId
  //       },
  //       include: {
  //         branches: true
  //       }
  //     })

  //     await this.createSampleData(newShop.branches[0].id, newShop.id, prisma)
  //   })
  // }

  // async update(
  //   params: {
  //     where: Prisma.ShopWhereUniqueInput
  //     data: UpdateShopDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params

  //   return this.prisma.shop.update({
  //     data: {
  //       name: data.name,
  //       businessTypeCode: data.businessTypeCode,
  //       status: data.status,
  //       photoURL: data.photoURL,
  //       address: data.address,
  //       email: data.email,
  //       phone: data.phone,
  //       updatedBy: tokenPayload.accountId
  //     },
  //     where: {
  //       id: where.id,
  //       isPublic: true,
  //       branches: {
  //         some: {
  //           accounts: {
  //             some: {
  //               id: tokenPayload.accountId,
  //               type: ACCOUNT_TYPE.STORE_OWNER
  //             }
  //           }
  //         }
  //       }
  //     }
  //   })
  // }

  // async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
  //   const count = await this.prisma.shop.updateMany({
  //     where: {
  //       id: {
  //         in: data.ids
  //       },
  //       isPublic: true,
  //       branches: {
  //         some: {
  //           accounts: {
  //             some: {
  //               id: tokenPayload.accountId,
  //               type: ACCOUNT_TYPE.STORE_OWNER
  //             }
  //           }
  //         }
  //       }
  //     },
  //     data: {
  //       isPublic: false,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   return { ...count, ids: data.ids } as DeleteManyResponse
  // }

  // async findUniq(where: Prisma.ShopWhereUniqueInput) {
  //   return this.prisma.shop.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true
  //     },
  //     include: {
  //       branches: {
  //         select: {
  //           id: true,
  //           name: true,
  //           bannerURL: true,
  //           photoURL: true,
  //           phone: true,
  //           address: true,
  //           createdAt: true,
  //           updatedAt: true
  //         },
  //         where: {
  //           isPublic: true
  //         }
  //       }
  //     }
  //   })
  // }

  // async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
  //   const { page, perPage, keyword, orderBy } = params

  //   const keySearch = ['name', 'code']

  //   const where: Prisma.ShopWhereInput = {
  //     isPublic: true,
  //     branches: {
  //       some: {
  //         accounts: {
  //           some: {
  //             id: tokenPayload.accountId
  //           }
  //         }
  //       }
  //     },
  //     ...(keyword && {
  //       OR: keySearch.map(key => ({
  //         [key]: { contains: removeDiacritics(keyword) }
  //       }))
  //     })
  //   }

  //   return await customPaginate(
  //     this.prisma.shop,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }

  // async generateShopCode() {
  //   const shop = await this.prisma.shop.findFirst({
  //     orderBy: {
  //       code: 'desc'
  //     },
  //     select: {
  //       code: true
  //     }
  //   })

  //   if (!shop) return 'IIT0001'

  //   const numberPart = +shop.code.slice(3)

  //   const nextNumber = (numberPart + 1).toString().padStart(4, '0')

  //   return `IIT${nextNumber}`
  // }

  // async getShopByKeyword(data: FindByCodeDto) {
  //   return this.prisma.shop.findUniqueOrThrow({
  //     where: {
  //       code: data.code
  //     }
  //   })
  // }

  // async createSampleData(
  //   branchId: string,
  //   shopId: string | null,
  //   prisma: PrismaClient
  // ) {
  //   const area = prisma.area.create({
  //     data: {
  //       name: 'Khu vực A',
  //       branchId: branchId,
  //       tables: {
  //         createMany: {
  //           data: [
  //             {
  //               name: 'Bàn 01',
  //               branchId: branchId,
  //               seat: 4
  //             },
  //             {
  //               name: 'Bàn 02',
  //               branchId: branchId,
  //               seat: 4
  //             },
  //             {
  //               name: 'Bàn 03',
  //               branchId: branchId,
  //               seat: 3
  //             },
  //             {
  //               name: 'Bàn 04',
  //               branchId: branchId,
  //               seat: 2
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   })

  //   let customerType = null
  //   let featureUsageSettings = null
  //   let pointSetting = null
  //   let qRSetting = null

  //   if (shopId) {
  //     customerType = prisma.customerType.create({
  //       data: {
  //         name: 'Khách thường',
  //         discount: 0,
  //         discountType: DISCOUNT_TYPE.VALUE,
  //         shopId: shopId
  //       }
  //     })

  //     featureUsageSettings = prisma.featureUsageSetting.createMany({
  //       data: [
  //         {
  //           featureCode: FEATURE_CODE.ONLINE_SELLING,
  //           shopId: shopId,
  //           isUsed: false
  //         },
  //         {
  //           featureCode: FEATURE_CODE.QR_CODE,
  //           shopId: shopId,
  //           isUsed: false
  //         }
  //       ]
  //     })

  //     pointSetting = prisma.pointSetting.create({
  //       data: {
  //         active: false,
  //         point: 0,
  //         value: 0,
  //         shopId: shopId
  //       }
  //     })

  //     qRSetting = prisma.qRSetting.createMany({
  //       data: {
  //         shopId: shopId,
  //         isShowBranchName: true,
  //         isShowTable: true,
  //         isShowLogo: true,
  //         isShowShopName: true,
  //         isShowWifi: false,
  //         description: 'Chúc bạn có một ngày tốt lành!'
  //       }
  //     })
  //   }

  //   const employeeGroups = prisma.employeeGroup.createMany({
  //     data: [
  //       {
  //         name: 'Nhân viên',
  //         branchId
  //       },
  //       {
  //         name: 'Bảo vệ',
  //         branchId
  //       }
  //     ]
  //   })

  //   const measurementUnits = prisma.measurementUnit.createMany({
  //     data: [
  //       {
  //         name: 'Cái',
  //         code: 'c',
  //         branchId
  //       },
  //       {
  //         name: 'Ly',
  //         code: 'l',
  //         branchId
  //       },
  //       {
  //         name: 'Bộ',
  //         code: 'b',
  //         branchId
  //       },
  //       {
  //         name: 'Kilogram',
  //         code: 'kg',
  //         branchId
  //       }
  //     ]
  //   })

  //   const paymentMethods = prisma.paymentMethod.createMany({
  //     data: [
  //       {
  //         branchId,
  //         type: PAYMENT_METHOD_TYPE.CASH,
  //         active: true,
  //         name: 'Tiền mặt'
  //       },
  //       {
  //         branchId,
  //         type: PAYMENT_METHOD_TYPE.BANKING,
  //         bankCode: '123456789',
  //         bankName: 'HD Bank',
  //         representative: 'Nguyen Van A',
  //         name: 'Chuyển khoản',
  //         active: false
  //       },
  //       {
  //         branchId,
  //         type: PAYMENT_METHOD_TYPE.QR_CODE,
  //         active: false,
  //         name: 'QR Code'
  //       }
  //     ]
  //   })

  //   const warehouse = prisma.warehouse.create({
  //     data: {
  //       name: 'Kho 01',
  //       branchId
  //     }
  //   })

  //   const roleCodes = [
  //     'CREATE_AREA',
  //     'UPDATE_AREA',
  //     'DELETE_AREA',
  //     'VIEW_AREA',
  //     'CREATE_CUSTOMER',
  //     'UPDATE_CUSTOMER',
  //     'DELETE_CUSTOMER',
  //     'VIEW_CUSTOMER',
  //     'CREATE_CUSTOMER_TYPE',
  //     'UPDATE_CUSTOMER_TYPE',
  //     'DELETE_CUSTOMER_TYPE',
  //     'VIEW_CUSTOMER_TYPE',
  //     'CREATE_EMPLOYEE_GROUP',
  //     'UPDATE_EMPLOYEE_GROUP',
  //     'DELETE_EMPLOYEE_GROUP',
  //     'VIEW_EMPLOYEE_GROUP',
  //     'CREATE_MEASUREMENT_UNIT',
  //     'UPDATE_MEASUREMENT_UNIT',
  //     'DELETE_MEASUREMENT_UNIT',
  //     'CREATE_ORDER',
  //     'UPDATE_ORDER',
  //     'DELETE_ORDER',
  //     'VIEW_ORDER',
  //     'CREATE_PERMISSION',
  //     'UPDATE_PERMISSION',
  //     'DELETE_PERMISSION',
  //     'VIEW_PERMISSION',
  //     'CREATE_PRODUCT',
  //     'UPDATE_PRODUCT',
  //     'DELETE_PRODUCT',
  //     'VIEW_PRODUCT',
  //     'CREATE_PRODUCT_TYPE',
  //     'UPDATE_PRODUCT_TYPE',
  //     'DELETE_PRODUCT_TYPE',
  //     'CREATE_TABLE',
  //     'UPDATE_TABLE',
  //     'DELETE_TABLE',
  //     'VIEW_TABLE',
  //     'CREATE_PRODUCT_OPTION_GROUP',
  //     'UPDATE_PRODUCT_OPTION_GROUP',
  //     'DELETE_PRODUCT_OPTION_GROUP',
  //     'VIEW_PRODUCT_OPTION_GROUP',
  //     'CREATE_EMPLOYEE',
  //     'UPDATE_EMPLOYEE',
  //     'DELETE_EMPLOYEE',
  //     'VIEW_EMPLOYEE',
  //     'CREATE_ACCOUNT',
  //     'UPDATE_ACCOUNT',
  //     'DELETE_ACCOUNT',
  //     'VIEW_SUPPLIER_TYPE',
  //     'CREATE_SUPPLIER_TYPE',
  //     'UPDATE_SUPPLIER_TYPE',
  //     'DELETE_SUPPLIER_TYPE',
  //     'VIEW_SUPPLIER',
  //     'CREATE_SUPPLIER',
  //     'UPDATE_SUPPLIER',
  //     'DELETE_SUPPLIER',
  //     'VIEW_PROMOTION',
  //     'CREATE_PROMOTION',
  //     'UPDATE_PROMOTION',
  //     'DELETE_PROMOTION',
  //     'VIEW_DISCOUNT_ISSUE',
  //     'CREATE_DISCOUNT_ISSUE',
  //     'UPDATE_DISCOUNT_ISSUE',
  //     'DELETE_DISCOUNT_ISSUE',
  //     'VIEW_WAREHOUSE',
  //     'UPDATE_WAREHOUSE',
  //     'VIEW_WORK_SHIFT',
  //     'CREATE_WORK_SHIFT',
  //     'UPDATE_WORK_SHIFT',
  //     'DELETE_WORK_SHIFT',
  //     'VIEW_EMPLOYEE_SCHEDULE',
  //     'CREATE_EMPLOYEE_SCHEDULE',
  //     'UPDATE_EMPLOYEE_SCHEDULE',
  //     'DELETE_EMPLOYEE_SCHEDULE',
  //     'VIEW_SALARY',
  //     'CREATE_SALARY',
  //     'UPDATE_SALARY',
  //     'DELETE_SALARY',
  //     'CONFIRM_SALARY'
  //   ]

  //   const employeeRoleCodes = [
  //     'VIEW_AREA',
  //     'CREATE_CUSTOMER',
  //     'UPDATE_CUSTOMER',
  //     'DELETE_CUSTOMER',
  //     'VIEW_CUSTOMER',
  //     'VIEW_CUSTOMER_TYPE',
  //     'CREATE_ORDER',
  //     'UPDATE_ORDER',
  //     'DELETE_ORDER',
  //     'VIEW_ORDER',
  //     'VIEW_PRODUCT',
  //     'VIEW_TABLE',
  //     'VIEW_PRODUCT_OPTION_GROUP',
  //     'VIEW_SUPPLIER_TYPE',
  //     'VIEW_SUPPLIER',
  //     'VIEW_PROMOTION',
  //     'VIEW_DISCOUNT_ISSUE',
  //     'VIEW_WAREHOUSE',
  //     'VIEW_WORK_SHIFT',
  //     'VIEW_EMPLOYEE_SCHEDULE',
  //     'CREATE_EMPLOYEE_SCHEDULE',
  //     'UPDATE_EMPLOYEE_SCHEDULE',
  //     'DELETE_EMPLOYEE_SCHEDULE',
  //     'VIEW_SALARY'
  //   ]

  //   const permissionAdmin = prisma.permission.create({
  //     data: {
  //       name: 'Quản trị viên',
  //       branchId,
  //       roles: {
  //         connect: roleCodes.map(code => ({
  //           code
  //         }))
  //       }
  //     }
  //   })

  //   const permissionEmployee = prisma.permission.create({
  //     data: {
  //       name: 'Nhân viên',
  //       branchId,
  //       roles: {
  //         connect: employeeRoleCodes.map(code => ({
  //           code
  //         }))
  //       }
  //     }
  //   })

  //   const productGroupOption = prisma.productOptionGroup.create({
  //     data: {
  //       name: 'Size',
  //       branchId,
  //       isMultiple: false,
  //       isRequired: true,
  //       productOptions: {
  //         createMany: {
  //           data: [
  //             {
  //               name: 'M',
  //               branchId
  //             },
  //             {
  //               name: 'L',
  //               branchId
  //             },
  //             {
  //               name: 'XL',
  //               branchId
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   })

  //   const productType = prisma.productType.create({
  //     data: {
  //       name: 'Đồ uống',
  //       slug: 'do-uong',
  //       description: 'Đồ uống...',
  //       branchId
  //     }
  //   })

  //   await Promise.all([
  //     area,
  //     customerType,
  //     employeeGroups,
  //     featureUsageSettings,
  //     measurementUnits,
  //     paymentMethods,
  //     pointSetting,
  //     warehouse,
  //     permissionAdmin,
  //     permissionEmployee,
  //     qRSetting,
  //     productGroupOption,
  //     productType
  //   ])
  // }
}
