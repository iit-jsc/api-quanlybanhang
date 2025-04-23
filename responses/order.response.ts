import { Prisma } from '@prisma/client'
import { accountShortSelect } from './account.response'
import { orderDetailShortSelect } from './order-detail.response'
import { paymentMethodSelect } from './payment-method.response'
import { tableSelect } from './table.response'

export const orderShortSelect: Prisma.OrderSelect = {
  id: true,
  code: true,
  status: true,
  type: true,
  isPaid: true,
  voucherValue: true,
  voucherProducts: true,
  discountCodeValue: true,
  customerDiscountValue: true,
  isSave: true,
  note: true,
  bankingImages: true,
  table: {
    select: tableSelect
  },
  paymentMethod: {
    select: paymentMethodSelect
  },
  creator: {
    select: accountShortSelect
  },
  orderDetails: {
    select: orderDetailShortSelect
  },
  updatedAt: true,
  createdAt: true
}

export const orderSelect: Prisma.OrderSelect = {
  id: true,
  code: true,
  status: true,
  type: true,
  isPaid: true,
  voucherValue: true,
  voucherProducts: true,
  discountCodeValue: true,
  customerDiscountValue: true,
  isSave: true,
  note: true,
  bankingImages: true,
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
