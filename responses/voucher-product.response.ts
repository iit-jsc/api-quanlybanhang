import { Prisma } from '@prisma/client'
import { productShortSelect } from './product.response'

export const voucherProductSelect: Prisma.VoucherProductSelect = {
  id: true,
  type: true,
  name: true,
  amount: true,
  promotionalPrice: true,
  photoURL: true,
  limitQuantity: true,
  product: {
    select: productShortSelect
  }
}
