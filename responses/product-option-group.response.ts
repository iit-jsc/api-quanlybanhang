import { Prisma } from '@prisma/client'

export const productOptionGroupSelect = (productId?: string): Prisma.ProductOptionGroupSelect => ({
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
      isAppliedToAll: true,
      isDefault: true,
      photoURL: true,
      updatedAt: true
    },
    where: {
      ...(productId && {
        products: {
          some: {
            id: productId
          }
        }
      })
    },
    orderBy: {
      createdAt: 'asc'
    }
  },
  updatedAt: true
})

export const productOptionSelect: Prisma.ProductOptionSelect = {
  id: true,
  name: true,
  price: true,
  productOptionGroupId: true,
  isAppliedToAll: true,
  isDefault: true,
  photoURL: true,
  updatedAt: true
}
