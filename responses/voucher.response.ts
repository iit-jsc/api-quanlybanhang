import { Prisma } from '@prisma/client'
import { voucherProductSelect } from './voucher-product.response'

export const voucherSelect: Prisma.VoucherSelect = {
  id: true,
  type: true,
  discount: true,
  discountType: true,
  isActive: true,
  amount: true,
  amountApplied: true,
  code: true,
  maxValue: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  updatedAt: true,
  voucherProducts: {
    select: voucherProductSelect
  }
}
