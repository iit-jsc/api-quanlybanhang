import { Prisma } from '@prisma/client'
import { productTypeSortSelect } from './product-type.response'
import { measurementUnitSelect } from './measurement-unit.response'
import { productOptionSelect } from './product-option-group.response'

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
  includedProductOptions: {
    select: productOptionSelect
  },
  measurementUnit: {
    select: measurementUnitSelect
  },
  productType: {
    select: productTypeSortSelect
  },
  updatedAt: true
}

export const productSortSelect: Prisma.ProductSelect = {
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
  updatedAt: true
}
