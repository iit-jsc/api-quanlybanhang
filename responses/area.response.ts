import { Prisma } from '@prisma/client'
import { tableSortSelect } from './table.response'

export const areaSelect: Prisma.AreaSelect = {
  id: true,
  name: true,
  photoURL: true,
  tables: {
    select: tableSortSelect
  },
  createdAt: true,
  updatedAt: true
}
