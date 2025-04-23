import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang thêm dữ liệu...')

  const areaIds = ['2b9410f8-6ef0-4618-ba1c-c57c72af961b', 'd87f1bdf-bddf-4701-b382-35c64cf57704']

  const totalTables = 50
  const batchSize = 100 // Số lượng bàn mỗi lần tạo
  const batches = Math.ceil(totalTables / batchSize)

  for (let batch = 0; batch < batches; batch++) {
    const start = batch * batchSize + 1
    const end = Math.min((batch + 1) * batchSize, totalTables)
    const currentBatchSize = end - start + 1

    const createPromises = Array.from({ length: currentBatchSize }, (_, i) => {
      const tableNumber = start + i
      const randomAreaIndex = Math.floor(Math.random() * areaIds.length)

      return prisma.table.create({
        data: {
          areaId: areaIds[randomAreaIndex],
          name: `Bàn ${tableNumber}`,
          seat: Math.floor(Math.random() * 10) + 1, // Số chỗ từ 1-10
          branchId: 'f87b1d1a-14b2-4330-9ca0-18cbaade679f'
        }
      })
    })

    await Promise.all(createPromises)
    console.log(`✅ Đã thêm bàn ${start} đến ${end}`)
  }

  console.log('🎉 Hoàn thành thêm 1000 bàn!')
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
