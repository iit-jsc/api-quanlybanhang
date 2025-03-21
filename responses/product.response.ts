import { Prisma } from '@prisma/client'
import { productTypeSortSelect } from './product-type.response'
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
    select: productTypeSortSelect
  },
  updatedAt: true
}
