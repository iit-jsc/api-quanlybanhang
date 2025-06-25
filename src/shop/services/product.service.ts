import slugify from 'slugify'
import { Injectable } from '@nestjs/common'
import { PrismaClient, ProductOptionType } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { generateCode } from 'utils/Helps'
import { PRODUCT_LIST_EXAMPLE } from 'data/example'

@Injectable()
export class ProductService {
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

    console.log('✅ Created measurement units!')
    return createdUnits
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
        {
          name: 'Đồ ăn',
          description: 'Các món ăn',
          products: ['Bánh mì', 'Cơm gà', 'Phở bò']
        },
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

        if (measurementUnitIds.length === 0) {
          return { createdType, createdProducts: [] }
        }

        const createdProducts = await Promise.all(
          type.products.map(productName => {
            const unitId = measurementUnitIds[Math.floor(Math.random() * measurementUnitIds.length)]
            const randomOption =
              PRODUCT_LIST_EXAMPLE[Math.floor(Math.random() * PRODUCT_LIST_EXAMPLE.length)]

            return prisma.product.create({
              data: {
                name: productName,
                slug: `${slugify(productName)}-${generateCode('')}`,
                branchId: branchId,
                unitId: unitId,
                productTypeId: createdType.id,
                price: faker.number.float({ min: 10000, max: 50000, precision: 1000 }),
                code: generateCode('SP'),
                oldPrice: faker.number.float({ min: 10000, max: 50000, precision: 1000 }),
                description: randomOption.description,
                thumbnail: randomOption.url,
                photoURLs: [randomOption.url]
              }
            })
          })
        )

        return { createdType, createdProducts }
      })
    )

    console.log('✅ Created product types and products!')
    return createdProductTypes
  }

  async createProductOptionGroupsAndOptions(
    branchId: string,
    businessTypeCode: string,
    prisma: PrismaClient
  ) {
    let productOptionGroups = []

    if (businessTypeCode === 'FOOD_BEVERAGE') {
      productOptionGroups = [
        {
          name: 'Size',
          isMultiple: false,
          isRequired: true,
          productOptions: [
            { name: 'M', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: true },
            { name: 'L', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false }
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

    const createdGroups = await Promise.all(
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

    console.log('✅ Created product option groups!')
    return createdGroups
  }
}
