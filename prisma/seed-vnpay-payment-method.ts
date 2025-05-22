import { PrismaClient, PaymentMethodType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang thêm phương thức thanh toán VNPAY cho tất cả chi nhánh...')

  const branches = await prisma.branch.findMany({ select: { id: true } })

  for (const branch of branches) {
    const existed = await prisma.paymentMethod.findFirst({
      where: {
        branchId: branch.id,
        type: PaymentMethodType.VNPAY
      }
    })

    if (!existed) {
      await prisma.paymentMethod.create({
        data: {
          type: PaymentMethodType.VNPAY,
          branchId: branch.id,
          active: false
        }
      })
      console.log(`✅ Đã thêm VNPAY cho chi nhánh ${branch.id}`)
    } else {
      console.log(`⚠️ Chi nhánh ${branch.id} đã có VNPAY, bỏ qua.`)
    }
  }

  console.log('🎉 Hoàn thành thêm phương thức thanh toán VNPAY cho tất cả chi nhánh!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
