import { Prisma } from '@prisma/client'
import { voucherProductSelect } from './voucher-product.response'
import { voucherConditionGroupSelect } from './voucher-condition-group.response'

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
  updatedAt: true
}

export const voucherDetailSelect: Prisma.VoucherSelect = {
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
  },
  conditionGroups: {
    select: voucherConditionGroupSelect
  }
}
