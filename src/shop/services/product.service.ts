import slugify from 'slugify'
import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { generateCode } from 'utils/Helps'

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
          products: [
            {
              name: 'Trà sữa',
              price: 25000,
              oldPrice: 30000,
              description: 'Trà sữa thơm ngon, pha chế theo công thức độc quyền',
              thumbnail: 'uploads/boba-tea.png',
              photoURLs: ['uploads/boba-tea.png']
            },
            {
              name: 'Cà phê',
              price: 20000,
              oldPrice: 25000,
              description: 'Cà phê rang xay nguyên chất, hương vị đậm đà',
              thumbnail: 'uploads/coffee-cup.png',
              photoURLs: ['uploads/coffee-cup.png']
            },
            {
              name: 'Nước cam',
              price: 15000,
              oldPrice: 18000,
              description: 'Nước cam tươi 100%, bổ sung vitamin C',
              thumbnail: 'uploads/orange-juice.png',
              photoURLs: ['uploads/orange-juice.png']
            }
          ]
        },
        {
          name: 'Đồ ăn',
          description: 'Các món ăn',
          products: [
            {
              name: 'Bánh mì',
              price: 12000,
              oldPrice: 15000,
              description: 'Bánh mì thịt nướng, pate, rau sống tươi ngon',
              thumbnail: 'uploads/bread.png',
              photoURLs: ['uploads/bread.png']
            },
            {
              name: 'Cơm gà',
              price: 35000,
              oldPrice: 40000,
              description: 'Cơm gà nướng thơm phức, ăn kèm nước mắm gừng',
              thumbnail: 'uploads/fried-chicken.png',
              photoURLs: ['uploads/fried-chicken.png']
            },
            {
              name: 'Phở bò',
              price: 45000,
              oldPrice: 50000,
              description: 'Phở bò tái chín, nước dùng niêu cùng nước từ xương',
              thumbnail: 'uploads/Beef-Pho.jpg',
              photoURLs: ['uploads/Beef-Pho.jpg']
            }
          ]
        },
        {
          name: 'Combo',
          description: 'Gói combo tiết kiệm',
          products: [
            {
              name: 'Pizza',
              price: 120000,
              oldPrice: 150000,
              description: 'Pizza hải sản phô mai mozzarella, giòn tan hấp dẫn',
              thumbnail: 'uploads/pizza.png',
              photoURLs: ['uploads/pizza.png']
            },
            {
              name: 'Hamburger',
              price: 65000,
              oldPrice: 80000,
              description: 'Hamburger bò nướng, rau xanh tươi ngon và sốt đặc biệt',
              thumbnail: 'uploads/hamburger.png',
              photoURLs: ['uploads/hamburger.png']
            },
            {
              name: 'Gà rán',
              price: 85000,
              oldPrice: 100000,
              description: 'Gà rán giòn rụm, ướp gia vị bí mật 11 loại thảo mộc',
              thumbnail: 'uploads/fried-chicken.png',
              photoURLs: ['uploads/fried-chicken.png']
            },
            {
              name: 'Sushi',
              price: 180000,
              oldPrice: 220000,
              description: 'Sushi cá hồi tươi, cơm sushi được nêm nước giấm đặc biệt',
              thumbnail: 'uploads/sushi.png',
              photoURLs: ['uploads/sushi.png']
            }
          ]
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
          type.products.map(productData => {
            const unitId = measurementUnitIds[Math.floor(Math.random() * measurementUnitIds.length)]

            return prisma.product.create({
              data: {
                name: productData.name,
                slug: `${slugify(productData.name)}-${generateCode('')}`,
                branchId: branchId,
                unitId: unitId,
                productTypeId: createdType.id,
                price: productData.price,
                code: generateCode('SP'),
                oldPrice: productData.oldPrice,
                description: productData.description,
                thumbnail: productData.thumbnail,
                photoURLs: productData.photoURLs
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

  // async createProductOptionGroupsAndOptions(
  //   branchId: string,
  //   businessTypeCode: string,
  //   prisma: PrismaClient
  // ) {
  //   let productOptionGroups = []

  //   if (businessTypeCode === 'FOOD_BEVERAGE') {
  //     productOptionGroups = [
  //       {
  //         name: 'Size',
  //         isMultiple: false,
  //         isRequired: true,
  //         productOptions: [
  //           { name: 'M', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: true },
  //           { name: 'L', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false }
  //         ]
  //       },
  //       {
  //         name: 'Topping',
  //         isMultiple: true,
  //         isRequired: false,
  //         productOptions: [
  //           { name: 'Trân châu', price: 5000, type: ProductOptionType.APPLY_ALL, isDefault: false },
  //           { name: 'Đậu đỏ', price: 4000, type: ProductOptionType.APPLY_ALL, isDefault: false },
  //           { name: 'Đậu xanh', price: 2000, type: ProductOptionType.APPLY_ALL, isDefault: false }
  //         ]
  //       },
  //       {
  //         name: 'Chân châu',
  //         isMultiple: true,
  //         isRequired: false,
  //         productOptions: [
  //           {
  //             name: 'Chân châu đen',
  //             price: 3000,
  //             type: ProductOptionType.APPLY_ALL,
  //             isDefault: false
  //           },
  //           {
  //             name: 'Chân châu trắng',
  //             price: 5000,
  //             type: ProductOptionType.APPLY_ALL,
  //             isDefault: false
  //           }
  //         ]
  //       }
  //     ]
  //   } else if (businessTypeCode === 'FASHION') {
  //     productOptionGroups = [
  //       {
  //         name: 'Size',
  //         isMultiple: false,
  //         isRequired: true,
  //         productOptions: [
  //           { name: 'S', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false },
  //           { name: 'M', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: true },
  //           { name: 'L', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false },
  //           { name: 'XL', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false }
  //         ]
  //       },
  //       {
  //         name: 'Màu sắc',
  //         isMultiple: false,
  //         isRequired: true,
  //         productOptions: [
  //           { name: 'Đen', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false },
  //           { name: 'Trắng', price: 0, type: ProductOptionType.APPLY_ALL, isDefault: false }
  //         ]
  //       }
  //     ]
  //   }

  //   const createdGroups = await Promise.all(
  //     productOptionGroups.map(async group => {
  //       return prisma.productOptionGroup.create({
  //         data: {
  //           name: group.name,
  //           isMultiple: group.isMultiple,
  //           isRequired: group.isRequired,
  //           branchId,
  //           productOptions: {
  //             create: group.productOptions.map(option => ({
  //               name: option.name,
  //               price: option.price,
  //               type: option.type,
  //               isDefault: option.isDefault
  //             }))
  //           }
  //         }
  //       })
  //     })
  //   )

  //   console.log('✅ Created product option groups!')
  //   return createdGroups
  // }
}
