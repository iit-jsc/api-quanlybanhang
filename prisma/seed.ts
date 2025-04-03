import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang thêm dữ liệu...')

  // Đọc nhiều file JSON đồng thời
  const [businessTypesData, shopsData, branchesData, usersData, accountsData] = await Promise.all([
    fs.readFile('./data/businessTypes.json', 'utf8'),
    fs.readFile('./data/shops.json', 'utf8'),
    fs.readFile('./data/branches.json', 'utf8'),
    fs.readFile('./data/users.json', 'utf8'),
    fs.readFile('./data/accounts.json', 'utf8')
  ])

  const businessTypes = JSON.parse(businessTypesData)
  const shops = JSON.parse(shopsData)
  const branches = JSON.parse(branchesData)
  const users = JSON.parse(usersData)
  const accounts = JSON.parse(accountsData)

  console.log('✅ Đã tải dữ liệu từ JSON!')

  // Seed Business Types
  await prisma.businessType.createMany({
    data: businessTypes,
    skipDuplicates: true
  })

  console.log('✅ Đã thêm BusinessType!')

  // Lấy thông tin BusinessType đồng thời
  const [businessCafe, businessTech] = await Promise.all([
    prisma.businessType.findUnique({ where: { code: 'FOOD_BEVERAGE' } }),
    prisma.businessType.findUnique({ where: { code: 'FASHION' } })
  ])

  if (!businessCafe || !businessTech) {
    throw new Error('❌ Không tìm thấy BusinessType phù hợp!')
  }

  // Seed Shops đồng thời
  const createdShops = await Promise.all(shops.map(shop => prisma.shop.create({ data: shop })))

  console.log('✅ Đã thêm Shops vào database!')

  const shopMap = {}

  createdShops.forEach(shop => {
    shopMap[shop.code] = shop.id
  })

  // Seed Branches đồng thời
  const createdBranches = await Promise.all(
    branches.map(branch =>
      prisma.branch.create({
        data: {
          ...branch,
          shopId: shopMap[branch.shopCode] // Gán shopId từ shopCode
        }
      })
    )
  )

  const branchMap = {}

  createdBranches.forEach(branch => {
    branchMap[branch.name] = branch.id
  })

  console.log('✅ Đã thêm 4 Chi Nhánh!')

  const createdUsers = await Promise.all(users.map(user => prisma.user.create({ data: user })))

  const userMap = {}

  createdUsers.forEach(user => {
    userMap[user.email] = user.id
  })

  await Promise.all(
    accounts.map(account =>
      prisma.account.create({
        data: {
          status: account.status,
          password: bcrypt.hashSync(account.password, 10),
          userId: userMap[account.email],
          branches: {
            connect: account.branches.map(branchName => ({ id: branchMap[branchName] })) // Gán branches từ tên
          }
        }
      })
    )
  )

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
