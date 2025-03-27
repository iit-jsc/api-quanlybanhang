import { Prisma } from '@prisma/client'
import { productSortSelect } from './product.response'

export const voucherConditionSelect: Prisma.VoucherConditionSelect = {
  id: true,
  type: true,
  limitQuantity: true,
  minCustomer: true,
  minOrderTotal: true,
  minQuantity: true,
  promotionalPrice: true,
  product: {
    select: productSortSelect
  }
}
