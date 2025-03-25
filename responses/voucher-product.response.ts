import { Prisma } from '@prisma/client'

export const voucherProductSelect: Prisma.VoucherProductSelect = {
  id: true,
  name: true,
  amount: true,
  photoURL: true
}
