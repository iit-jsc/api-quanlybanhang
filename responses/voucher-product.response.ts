import { Prisma } from '@prisma/client'
import { productSortSelect } from './product.response'

export const voucherProductSelect: Prisma.VoucherProductSelect = {
  id: true,
  name: true,
  amount: true,
  photoURL: true,
  product: {
    select: productSortSelect
  }
}
