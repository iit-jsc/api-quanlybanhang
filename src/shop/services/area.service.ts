import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class AreaService {
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
          { name: 'Bàn 4', seat: 6 },
          { name: 'Bàn 5', seat: 2 }
        ]
      }
    ]

    const createdAreas = await Promise.all(
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

    console.log('✅ Created areas and tables!')
    return createdAreas
  }
}
