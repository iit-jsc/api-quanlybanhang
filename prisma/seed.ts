import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang thêm dữ liệu...')

  // Seed Business Types
  await prisma.businessType.createMany({
    data: [
      {
        code: 'CAFE',
        name: 'Quán Cà Phê',
        icon: '☕',
        description: 'Dịch vụ quán cà phê, trà sữa và đồ uống.'
      },
      {
        code: 'TECH',
        name: 'Công Nghệ',
        icon: '💻',
        description: 'Cửa hàng thiết bị công nghệ, phần mềm.'
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Đã thêm BusinessType!')

  // Lấy thông tin BusinessType đồng thời
  const [businessCafe, businessTech] = await Promise.all([
    prisma.businessType.findUnique({ where: { code: 'CAFE' } }),
    prisma.businessType.findUnique({ where: { code: 'TECH' } })
  ])

  if (!businessCafe || !businessTech) {
    throw new Error('❌ Không tìm thấy BusinessType phù hợp!')
  }

  // Seed Shops đồng thời
  const [cafeShop, techShop] = await Promise.all([
    prisma.shop.create({
      data: {
        name: 'Highland Coffee',
        code: 'CAFE001',
        businessTypeCode: businessCafe.code,
        status: 'ACTIVE',
        phone: '0901234567',
        email: 'highland@example.com',
        address: '456 Đường Cà Phê, TP.HCM',
        photoURL: 'https://example.com/cafe.jpg',
        domain: 'highlandcoffee.com'
      }
    }),
    prisma.shop.create({
      data: {
        name: 'Tech Store',
        code: 'TECH123',
        businessTypeCode: businessTech.code,
        status: 'ACTIVE',
        phone: '0123456789',
        email: 'techstore@example.com',
        address: '123 Tech Street, City',
        photoURL: 'https://example.com/shop.jpg',
        domain: 'techstore.com'
      }
    })
  ])

  console.log('✅ Đã thêm 2 Shop!')

  // Seed Branches đồng thời
  const [branch1, branch2, branch3, branch4] = await Promise.all([
    prisma.branch.create({
      data: {
        name: 'Highland - Chi Nhánh 1',
        shopId: cafeShop.id,
        address: 'Q1, TP.HCM',
        phone: '0901000001'
      }
    }),
    prisma.branch.create({
      data: {
        name: 'Highland - Chi Nhánh 2',
        shopId: cafeShop.id,
        address: 'Q3, TP.HCM',
        phone: '0901000002'
      }
    }),
    prisma.branch.create({
      data: {
        name: 'Tech Store - CN Hà Nội',
        shopId: techShop.id,
        address: 'Cầu Giấy, Hà Nội',
        phone: '0123000001'
      }
    }),
    prisma.branch.create({
      data: {
        name: 'Tech Store - CN TP.HCM',
        shopId: techShop.id,
        address: 'Quận 10, TP.HCM',
        phone: '0123000002'
      }
    })
  ])

  console.log('✅ Đã thêm 4 Chi Nhánh!')

  // Seed Users đồng thời
  const [user1, user2] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Nguyễn Văn A',
        phone: '0909999999',
        email: 'user1@example.com'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Trần Thị B',
        phone: '0918888888',
        email: 'user2@example.com'
      }
    })
  ])

  console.log('✅ Đã thêm 2 Users!')

  // Seed Accounts đồng thời
  await Promise.all([
    prisma.account.create({
      data: {
        status: 'ACTIVE',
        password: bcrypt.hashSync('aA@123', 10),
        userId: user1.id,
        branches: {
          connect: [{ id: branch1.id }, { id: branch2.id }] // User1 thuộc Highland - CN1
        }
      }
    }),
    prisma.account.create({
      data: {
        status: 'ACTIVE',
        password: bcrypt.hashSync('aA@123', 10),
        userId: user2.id,
        branches: {
          connect: [{ id: branch3.id }] // User2 thuộc Tech Store - CN Hà Nội
        }
      }
    })
  ])

  console.log('✅ Đã thêm 2 Accounts!')
}

main()
  .then(() => {
    // console.log("Seeding completed!");
  })
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
