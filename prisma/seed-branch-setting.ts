import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Đang kiểm tra và thêm cài đặt chi nhánh...')

    // Lấy danh sách chi nhánh chưa có cài đặt
    const branchesWithoutSettings = await prisma.branch.findMany({
      where: {
        branchSetting: null
      },
      select: {
        id: true,
        name: true
      }
    })

    if (branchesWithoutSettings.length === 0) {
      console.log('✅ Tất cả chi nhánh đã có cài đặt!')
      return
    }

    console.log(`📝 Tìm thấy ${branchesWithoutSettings.length} chi nhánh cần thêm cài đặt`)

    // Tạo cài đặt cho nhiều chi nhánh cùng lúc
    const result = await prisma.branchSetting.createMany({
      data: branchesWithoutSettings.map(branch => ({
        branchId: branch.id,
        useKitchen: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      skipDuplicates: true
    })

    console.log(`✅ Đã thêm cài đặt cho ${result.count} chi nhánh`)

    // Log chi tiết các chi nhánh đã thêm cài đặt
    console.log('📋 Chi tiết:')
    branchesWithoutSettings.forEach(branch => {
      console.log(`   - ${branch.name} (${branch.id})`)
    })
  } catch (error) {
    console.error('❌ Lỗi khi thêm cài đặt chi nhánh:', error)
    throw error
  }
}

main()
  .then(() => {
    console.log('🎉 Hoàn tất quá trình seed branch settings!')
  })
  .catch(error => {
    console.error('❌ Lỗi trong quá trình seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
