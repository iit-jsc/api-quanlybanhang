import { Prisma } from '@prisma/client'

export const vatGroupSelect: Prisma.VATGroupSelect = {
  id: true,
  name: true,
  vatRate: true,
  branchId: true,
  createdAt: true,
  updatedAt: true
}
