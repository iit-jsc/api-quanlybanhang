import { Prisma } from '@prisma/client'
import { productTypeShortSelect } from './product-type.response'
import { measurementUnitSelect } from './measurement-unit.response'
import { vatGroupSelect } from './vat-group.response'

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
  hasVat: true,
  vatGroup: {
    select: vatGroupSelect
  },
  measurementUnit: {
    select: measurementUnitSelect
  },
  productType: {
    select: productTypeShortSelect
  },
  updatedAt: true
}
