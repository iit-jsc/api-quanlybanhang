import { Prisma } from '@prisma/client'

export const productTypeSelect: Prisma.ProductTypeSelect = {
  id: true,
  slug: true,
  branchId: true,
  name: true,
  description: true,
  products: true,
  updatedAt: true
}

export const productTypeSortSelect: Prisma.ProductTypeSelect = {
  id: true,
  slug: true,
  branchId: true,
  name: true,
  description: true,
  updatedAt: true
}
