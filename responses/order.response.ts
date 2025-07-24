import { Prisma } from '@prisma/client'
import { accountShortSelect } from './account.response'
import { orderDetailShortSelect } from './order-detail.response'
import { paymentMethodSelect } from './payment-method.response'
import { tableSelect } from './table.response'
import { customerSelect } from './customer.response'

export const orderSelect: Prisma.OrderSelect = {
  id: true,
  code: true,
  type: true,
  paymentStatus: true,
  orderTotal: true,
  moneyReceived: true,
  isSave: true,
  isTaxApplied: true,
  note: true,
  bankingImages: true,
  branchId: true,
  tableId: true,
  paymentMethodId: true,
  totalTax: true,
  totalTaxDiscount: true,
  customerId: true,
  discountValue: true,
  paymentAt: true,
  customer: {
    select: customerSelect
  },
  table: {
    select: tableSelect
  },
  paymentMethod: {
    select: paymentMethodSelect
  },
  creator: {
    select: accountShortSelect
  },
  updater: {
    select: accountShortSelect
  },
  orderDetails: {
    select: orderDetailShortSelect
  },
  updatedAt: true,
  createdAt: true
}
