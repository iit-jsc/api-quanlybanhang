import { Prisma } from '@prisma/client'
import { productTypeShortSelect } from './product-type.response'
import { measurementUnitSelect } from './measurement-unit.response'

export const productSelect: Prisma.ProductSelect = {
  id: true,
  branchId: true,
  unitId: true,
  name: true,
  code: true,
  price: true,
  thumbnail: true,
  oldPrice: true,
  description: true,
  photoURLs: true,
  status: true,
  slug: true,
  measurementUnit: {
    select: measurementUnitSelect
  },
  productType: {
    select: productTypeShortSelect
  },
  updatedAt: true
}

export const productShortSelect: Prisma.ProductSelect = {
  id: true,
  branchId: true,
  unitId: true,
  name: true,
  code: true,
  price: true,
  thumbnail: true,
  oldPrice: true,
  description: true,
  photoURLs: true,
  status: true,
  slug: true,
  measurementUnit: {
    select: measurementUnitSelect
  },
  updatedAt: true
}
