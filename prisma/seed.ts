import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang thêm dữ liệu...')

  // Đọc nhiều file JSON đồng thời
  const [businessTypesData, permissionData] = await Promise.all([
    fs.readFile('./data/business-types.json', 'utf8'),
    fs.readFile('./data/permission-groups.json', 'utf8')
  ])

  const businessTypes = JSON.parse(businessTypesData)
  const permissionGroups = JSON.parse(permissionData)

  console.log('✅ Đã tải dữ liệu từ JSON!')

  await Promise.all([
    prisma.businessType.createMany({
      data: businessTypes,
      skipDuplicates: true
    }),
    permissionGroups.map(async group => {
      return await prisma.permissionGroup.create({
        data: {
          name: group.name,
          type: group.type,
          code: group.code,
          permissions: {
            create: group.permissions.map(permission => ({
              code: permission.code,
              name: permission.name
            }))
          }
        }
      })
    })
  ])
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
