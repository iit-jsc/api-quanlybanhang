import { Prisma } from '@prisma/client'
import { voucherConditionSelect } from './voucher-condition.response'

export const voucherConditionGroupSelect: Prisma.VoucherConditionGroupSelect = {
  id: true,
  operator: true,
  conditions: {
    select: voucherConditionSelect
  }
}
