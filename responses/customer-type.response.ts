import { Prisma } from '@prisma/client'

export const customerTypeSelect: Prisma.CustomerTypeSelect = {
  id: true,
  name: true,
  description: true,
  discount: true,
  discountType: true,
  createdAt: true,
  updatedAt: true
}
