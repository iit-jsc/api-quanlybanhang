import * as bcrypt from 'bcrypt'
import slugify from 'slugify'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateShopDto, CreateUserDto } from './dto/shop.dto'
import { DiscountType, PaymentMethodType, PrismaClient, ProductOptionType } from '@prisma/client'
import { generateCode } from 'utils/Helps'
@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateShopDto) {
    console.log('🌱 Đang setup dữ liệu...')

    return await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        // Tạo cửa hàng
        const newShop = await prisma.shop.create({
          data: {
            name: data.name,
            code: data.code,
            businessTypeCode: data.businessTypeCode
          },
          include: {
            businessType: true
          }
        })

        console.log('✅ Đã thêm cửa hàng mới!')

        // Tạo chi nhánh trong phạm vi giao dịch / Tạo vai trò
        const [newBranches, newRoles] = await Promise.all([
          this.createBranches(data.totalBranches, newShop.id, prisma),
          this.createRoles(newShop.id, prisma)
        ])

        const adminRole = newRoles.find(role => role.name === 'Quản trị viên')

        // Tạo người dùng / nhóm nhân viên / nhóm khách hàng
        await Promise.all([
          this.createUser(
            data.user,
            newBranches.map(branch => branch.id),
            adminRole.id,
            prisma
          ),
          this.createEmployeeGroups(newShop.id, prisma),
          this.createCustomerTypes(newShop.id, prisma)
        ])

        // Tạo các đơn vị đo, loại sản phẩm và khu vực cho từng chi nhánh trong phạm vi giao dịch
        return await Promise.all(
          newBranches.map(async branch => {
            // Tạo measurementUnits trước
            const measurementUnits = await this.createMeasurementUnit(
              newShop.businessType.code,
              branch.id,
              prisma
            )

            await this.createProductTypes(
              newShop.businessType.code,
              branch.id,
              measurementUnits.map(item => item.id),
              prisma
            )

            // Tạo areas / phương thức thanh toán / topping
            await Promise.all([
              this.createAreas(branch.id, prisma),
              this.createPaymentMethods(branch.id, prisma),
              this.createProductOptionGroupsAndOptions(branch.id, data.businessTypeCode, prisma)
            ])
          })
        )
      },
      {
        maxWait: 5000,
        timeout: 10000
      }
    )
  }

  async createBranches(totalBranches: number, shopId: string, prisma: PrismaClient) {
    const branchPromises = Array.from({ length: totalBranches }, () =>
      prisma.branch.create({
        data: {
          shopId,
          name: faker.company.name(),
          photoURL: faker.image.avatar(),
          bannerURL: faker.image.imageUrl(),
          address: faker.location.streetAddress()
        }
      })
    )

    console.log('✅ Đã thêm cửa hàng!')

    return Promise.all(branchPromises)
  }

  async createMeasurementUnit(businessTypeCode: string, branchId: string, prisma: PrismaClient) {
    let measurementUnits = []

    if (businessTypeCode === 'FOOD_BEVERAGE') {
      measurementUnits = [
        { name: 'Ly', code: 'LY' },
        { name: 'Chai', code: 'CHAI' },
        { name: 'Kg', code: 'KG' }
      ]
    } else if (businessTypeCode === 'FASHION') {
      measurementUnits = [
        { name: 'Cái', code: 'CAI' },
        { name: 'Bộ', code: 'BO' },
        { name: 'Đôi', code: 'DOI' }
      ]
    }

    // Dùng Promise.all để tối ưu hiệu suất
    const createdUnits = await Promise.all(
      measurementUnits.map(unit =>
        prisma.measurementUnit.create({
          data: {
            ...unit,
            branchId: branchId
          }
        })
      )
    )

    console.log('✅ Đã tạo đơn vị tính!')

    return createdUnits
  }

  async createRoles(shopId: string, prisma: PrismaClient) {
    // logic tạo role
    const roles = [
      {
        name: 'Nhân viên',
        description: 'Vai trò dành cho nhân viên cửa hàng',
        permissions: [
          'VIEW_AREA',
          'VIEW_TABLE',
          'ADD_DISH_TO_TABLE',
          'SEPARATE_TABLE',
          'CREATE_CUSTOMER',
          'UPDATE_CUSTOMER',
          'VIEW_CUSTOMER',
          'VIEW_CUSTOMER_TYPE',
          'VIEW_PRODUCT_TYPE',
          'VIEW_PRODUCT',
          'VIEW_MEASUREMENT_UNIT',
          'VIEW_PAYMENT_METHOD',
          'VIEW_DISCOUNT_ISSUE',
          'VIEW_DISCOUNT_CODE',
          'VIEW_EMPLOYEE_GROUP',
          'DELETE_CUSTOMER_REQUEST',
          'UPDATE_CUSTOMER_REQUEST',
          'CREATE_ORDER',
          'UPDATE_ORDER',
          'DELETE_ORDER',
          'VIEW_ORDER',
          'PAYMENT_ORDER',
          'SAVE_ORDER',
          'CANCEL_ORDER'
        ]
      },
      {
        name: 'Quản trị viên',
        description: 'Vai trò dành cho quản lý cửa hàng',
        permissions: [
          'CREATE_AREA',
          'UPDATE_AREA',
          'DELETE_AREA',
          'VIEW_AREA',
          'CREATE_TABLE',
          'UPDATE_TABLE',
          'DELETE_TABLE',
          'VIEW_TABLE',
          'ADD_DISH_TO_TABLE',
          'SEPARATE_TABLE',
          'CREATE_ROLE',
          'UPDATE_ROLE',
          'DELETE_ROLE',
          'VIEW_ROLE',
          'CREATE_CUSTOMER',
          'UPDATE_CUSTOMER',
          'DELETE_CUSTOMER',
          'VIEW_CUSTOMER',
          'CREATE_CUSTOMER_TYPE',
          'UPDATE_CUSTOMER_TYPE',
          'DELETE_CUSTOMER_TYPE',
          'VIEW_CUSTOMER_TYPE',
          'CREATE_PRODUCT_TYPE',
          'UPDATE_PRODUCT_TYPE',
          'DELETE_PRODUCT_TYPE',
          'VIEW_PRODUCT_TYPE',
          'CREATE_PRODUCT',
          'UPDATE_PRODUCT',
          'DELETE_PRODUCT',
          'VIEW_PRODUCT',
          'CREATE_MEASUREMENT_UNIT',
          'UPDATE_MEASUREMENT_UNIT',
          'DELETE_MEASUREMENT_UNIT',
          'VIEW_MEASUREMENT_UNIT',
          'CREATE_PRODUCT_OPTION_GROUP',
          'UPDATE_PRODUCT_OPTION_GROUP',
          'DELETE_PRODUCT_OPTION_GROUP',
          'UPDATE_PAYMENT_METHOD',
          'VIEW_PAYMENT_METHOD',
          'CREATE_DISCOUNT_ISSUE',
          'UPDATE_DISCOUNT_ISSUE',
          'DELETE_DISCOUNT_ISSUE',
          'VIEW_DISCOUNT_ISSUE',
          'CREATE_DISCOUNT_CODE',
          'DELETE_DISCOUNT_CODE',
          'VIEW_DISCOUNT_CODE',
          'CREATE_VOUCHER',
          'DELETE_VOUCHER',
          'UPDATE_VOUCHER',
          'CREATE_EMPLOYEE_GROUP',
          'UPDATE_EMPLOYEE_GROUP',
          'DELETE_EMPLOYEE_GROUP',
          'VIEW_EMPLOYEE_GROUP',
          'CREATE_USER',
          'UPDATE_USER',
          'DELETE_USER',
          'VIEW_USER',
          'UPDATE_MY_INFORMATION',
          'DELETE_CUSTOMER_REQUEST',
          'UPDATE_CUSTOMER_REQUEST',
          'CREATE_ORDER',
          'UPDATE_ORDER',
          'DELETE_ORDER',
          'VIEW_ORDER',
          'PAYMENT_ORDER',
          'SAVE_ORDER',
          'CANCEL_ORDER'
        ]
      }
    ]

    const rolePromises = roles.map(role =>
      prisma.role.create({
        data: {
          name: role.name,
          description: role.description,
          shopId,
          permissions: {
            connect: role.permissions.map(code => ({ code }))
          }
        }
      })
    )

    console.log('✅ Đã thêm vai trò!')

    return Promise.all(rolePromises)
  }

  async createUser(data: CreateUserDto, branchIds: string[], roleId: string, prisma: PrismaClient) {
    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: faker.person.fullName(),
        code: faker.string.alphanumeric(6),
        address: faker.location.streetAddress(),
        cardId: faker.string.numeric(12),
        cardDate: faker.date.past(),
        cardAddress: faker.location.city(),
        birthday: faker.date.birthdate(),
        sex: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        account: {
          create: {
            password: bcrypt.hashSync(data.password, 10),
            roles: {
              connect: { id: roleId }
            },
            branches: {
              connect: branchIds.map(id => ({ id }))
            }
          }
        }
      }
    })
    console.log('✅ Đã tạo người dùng và tài khoản!')
    return user
  }

  async createEmployeeGroups(shopId: string, prisma: PrismaClient) {
    const employeeGroups = [
      {
        name: 'Nhân viên',
        description: 'Nhóm dành cho nhân viên cửa hàng.'
      },
      {
        name: 'Quản lý',
        description: 'Nhóm dành cho quản lý cửa hàng.'
      }
    ]

    // Tạo các nhóm nhân viên trong cơ sở dữ liệu
    const groupPromises = employeeGroups.map(group =>
      prisma.employeeGroup.create({
        data: {
          name: group.name,
          description: group.description,
          shopId
        }
      })
    )

    // Chờ tất cả các nhóm được tạo
    const createdGroups = await Promise.all(groupPromises)

    console.log('✅ Đã tạo nhóm nhân viên!')

    return createdGroups
  }

  async createProductTypes(
    businessTypeCode: string,
    branchId: string,
    measurementUnitIds: string[],
    prisma: PrismaClient
  ) {
    let productTypes = []

    if (businessTypeCode === 'FOOD_BEVERAGE') {
      productTypes = [
        {
          name: 'Đồ uống',
          description: 'Các loại nước uống',
          products: ['Trà sữa', 'Cà phê', 'Nước cam']
        },
        { name: 'Đồ ăn', description: 'Các món ăn', products: ['Bánh mì', 'Cơm gà', 'Phở bò'] },
        {
          name: 'Combo',
          description: 'Gói combo tiết kiệm',
          products: ['Combo sáng', 'Combo trưa', 'Combo tối']
        }
      ]
    } else if (businessTypeCode === 'FASHION') {
      productTypes = [
        {
          name: 'Áo',
          description: 'Các loại áo thun, sơ mi, hoodie',
          products: ['Áo thun', 'Áo sơ mi', 'Hoodie']
        },
        {
          name: 'Quần',
          description: 'Quần jeans, quần kaki, quần short',
          products: ['Jeans', 'Kaki', 'Short']
        },
        {
          name: 'Giày Dép',
          description: 'Các loại giày sneaker, sandal',
          products: ['Sneaker', 'Sandal', 'Giày lười']
        }
      ]
    }

    if (productTypes.length === 0) {
      return []
    }

    const createdProductTypes = await Promise.all(
      productTypes.map(async type => {
        const createdType = await prisma.productType.create({
          data: {
            name: type.name,
            slug: slugify(type.name),
            description: type.description,
            branchId: branchId
          }
        })

        // Nếu không có đơn vị đo nào, không tạo sản phẩm
        if (measurementUnitIds.length === 0) {
          return { createdType, createdProducts: [] }
        }

        // Tạo sản phẩm
        const createdProducts = await Promise.all(
          type.products.map(productName => {
            const unitId = measurementUnitIds[Math.floor(Math.random() * measurementUnitIds.length)]
            return prisma.product.create({
              data: {
                name: productName,
                slug: `${slugify(productName)}-${generateCode('')}`,
                branchId: branchId,
                unitId: unitId,
                productTypeId: createdType.id,
                price: faker.number.float({ min: 10000, max: 500000, precision: 1000 }),
                code: generateCode('SP'),
                oldPrice: faker.number.float({ min: 10000, max: 500000, precision: 1000 }),
                description: faker.commerce.productDescription(),
                thumbnail: faker.image.urlPicsumPhotos(),
                photoURLs: [faker.image.url(), faker.image.url()]
              }
            })
          })
        )

        return { createdType, createdProducts }
      })
    )

    console.log('✅ Đã tạo loại sản phẩm!')

    return createdProductTypes
  }

  async createAreas(branchId: string, prisma: PrismaClient) {
    const areasData = [
      {
        name: 'Khu vực A',
        tables: [
          { name: 'Bàn 1', seat: 4 },
          { name: 'Bàn 2', seat: 4 },
          { name: 'Bàn 3', seat: 2 }
        ]
      },
      {
        name: 'Khu vực B',
        tables: [
          { name: 'Bàn 1', seat: 6 },
          { name: 'Bàn 2', seat: 2 }
        ]
      }
    ]

    console.log('✅ Đã tạo khu vực!')

    return await Promise.all(
      areasData.map(async areaData => {
        return await prisma.area.create({
          data: {
            name: areaData.name,
            branchId: branchId,
            tables: {
              create: areaData.tables.map(table => ({
                name: table.name,
                seat: table.seat,
                branchId
              }))
            }
          }
        })
      })
    )
  }

  async createCustomerTypes(shopId: string, prisma: PrismaClient) {
    const customerTypes = [
      {
        name: 'Khách VIP',
        description: 'Khách hàng thân thiết, được hưởng nhiều ưu đãi.',
        discount: 10,
        discountType: DiscountType.PERCENT
      },
      {
        name: 'Khách vãng lai',
        description: 'Khách hàng không có ưu đãi đặc biệt.',
        discount: 0,
        discountType: DiscountType.VALUE
      }
    ]

    const createdCustomerTypes = await Promise.all(
      customerTypes.map(customerType =>
        prisma.customerType.create({
          data: {
            name: customerType.name,
            description: customerType.description,
            discount: customerType.discount,
            discountType: customerType.discountType,
            shopId: shopId
          }
        })
      )
    )

    console.log('✅ Đã tạo nhóm khách hàng!')

    return createdCustomerTypes
  }

  async createPaymentMethods(branchId: string, prisma: PrismaClient) {
    const paymentMethods = [
      {
        bankName: 'Vietcombank',
        bankCode: 'VCB123',
        representative: 'Nguyễn Văn A',
        type: PaymentMethodType.BANKING,
        active: false
      },
      {
        bankName: null,
        bankCode: null,
        representative: null,
        type: PaymentMethodType.QR_CODE,
        active: false
      },
      {
        bankName: null,
        bankCode: null,
        representative: null,
        type: PaymentMethodType.CASH,
        active: true
      }
    ]

    // Dùng Prisma để tạo các phương thức thanh toán cho chi nhánh
    const createdPaymentMethods = await prisma.paymentMethod.createMany({
      data: paymentMethods.map(paymentMethod => ({
        branchId,
        bankName: paymentMethod.bankName,
        bankCode: paymentMethod.bankCode,
        representative: paymentMethod.representative,
        type: paymentMethod.type,
        active: paymentMethod.active
      }))
    })

    console.log('✅ Đã tạo phương thức thanh toán!')

    return createdPaymentMethods
  }

  async createProductOptionGroupsAndOptions(
    branchId: string,
    businessTypeCode: string,
    prisma: PrismaClient
  ) {
    let productOptionGroups = []

    if (businessTypeCode === 'FOOD_BEVERAGE') {
      // Tạo nhóm sản phẩm cho quán ăn uống
      productOptionGroups = [
        {
          name: 'Size',
          isMultiple: false,
          isRequired: true,
          productOptions: [
            { name: 'M', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: true }, // Size M
            { name: 'L', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false } // Size L
          ]
        },
        {
          name: 'Topping',
          isMultiple: true,
          isRequired: false,
          productOptions: [
            { name: 'Trân châu', price: 5000, type: ProductOptionType.APPLY_ALL, isDefault: false },
            { name: 'Đậu đỏ', price: 4000, type: ProductOptionType.APPLY_ALL, isDefault: false },
            { name: 'Đậu xanh', price: 2000, type: ProductOptionType.APPLY_ALL, isDefault: false }
          ]
        },
        {
          name: 'Chân châu',
          isMultiple: true,
          isRequired: false,
          productOptions: [
            {
              name: 'Chân châu đen',
              price: 3000,
              type: ProductOptionType.APPLY_ALL,
              isDefault: false
            },
            {
              name: 'Chân châu trắng',
              price: 5000,
              type: ProductOptionType.APPLY_ALL,
              isDefault: false
            }
          ]
        }
      ]
    } else if (businessTypeCode === 'FASHION') {
      // Tạo nhóm sản phẩm cho quần áo
      productOptionGroups = [
        {
          name: 'Size',
          isMultiple: false,
          isRequired: true,
          productOptions: [
            { name: 'S', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false },
            { name: 'M', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: true },
            { name: 'L', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false },
            { name: 'XL', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false }
          ]
        },
        {
          name: 'Màu sắc',
          isMultiple: false,
          isRequired: true,
          productOptions: [
            { name: 'Đen', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false },
            { name: 'Trắng', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false }
          ]
        }
      ]
    }

    console.log('✅ Đã tạo nhóm tùy chọn!')

    // Thêm vào cơ sở dữ liệu
    return await Promise.all(
      productOptionGroups.map(async group => {
        return prisma.productOptionGroup.create({
          data: {
            name: group.name,
            isMultiple: group.isMultiple,
            isRequired: group.isRequired,
            branchId,
            productOptions: {
              create: group.productOptions.map(option => ({
                name: option.name,
                price: option.price,
                type: option.type,
                isDefault: option.isDefault
              }))
            }
          }
        })
      })
    )
  }
}
