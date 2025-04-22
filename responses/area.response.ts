import { Prisma } from '@prisma/client'
import { tableSelect } from './table.response'

export const areaSelect: Prisma.AreaSelect = {
  id: true,
  name: true,
  photoURL: true,
  tables: {
    select: tableSelect
  },
  createdAt: true,
  updatedAt: true
}
