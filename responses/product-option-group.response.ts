import { Prisma } from '@prisma/client'

export const productOptionGroupSelect: Prisma.ProductOptionGroupSelect = {
  id: true,
  name: true,
  isMultiple: true,
  isRequired: true,
  productOptions: {
    select: {
      id: true,
      name: true,
      price: true,
      productOptionGroupId: true,
      isDefault: true,
      photoURL: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  },
  updatedAt: true
}
