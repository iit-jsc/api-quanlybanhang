import { Prisma } from '@prisma/client'
import { productShortSelect } from './product.response'

export const voucherConditionSelect: Prisma.VoucherConditionSelect = {
  id: true,
  type: true,
  minCustomer: true,
  minOrderTotal: true,
  minQuantity: true,
  product: {
    select: productShortSelect
  }
}
