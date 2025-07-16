import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Đang kiểm tra và cập nhật role Quản trị viên...')

    // Tìm tất cả role có tên "Quản trị viên"
    const adminRoles = await prisma.role.findMany({
      where: {
        name: 'Quản trị viên'
      },
      select: {
        id: true,
        name: true,
        isRoot: true
      }
    })

    if (adminRoles.length === 0) {
      console.log('❌ Không tìm thấy role "Quản trị viên" nào!')
      return
    }

    console.log(`📝 Tìm thấy ${adminRoles.length} role "Quản trị viên"`)

    // Lọc ra các role chưa có isRoot = true
    const rolesToUpdate = adminRoles.filter(role => !role.isRoot)

    if (rolesToUpdate.length === 0) {
      console.log('✅ Tất cả role "Quản trị viên" đã có isRoot = true!')
      return
    }

    // Cập nhật isRoot = true cho các role "Quản trị viên"
    const result = await prisma.role.updateMany({
      where: {
        name: 'Quản trị viên'
      },
      data: {
        isRoot: true,
        name: 'Vai trò gốc',
        description: 'Vai trò gốc với tất cả quyền hạn, không thể điều chỉnh',
        updatedAt: new Date()
      }
    })

    console.log(`✅ Đã cập nhật isRoot = true cho ${result.count} role "Quản trị viên"`)

    // Log chi tiết các role đã cập nhật
    console.log('📋 Chi tiết:')
    rolesToUpdate.forEach(role => {
      console.log(`   - ${role.name} (${role.id})`)
    })
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật role Quản trị viên:', error)
    throw error
  }
}

main()
  .then(() => {
    console.log('🎉 Hoàn tất quá trình cập nhật role!')
  })
  .catch(error => {
    console.error('❌ Lỗi trong quá trình seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
