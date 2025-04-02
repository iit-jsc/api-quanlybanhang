import { Prisma } from '@prisma/client'
import { accountSortSelect } from './account.response'
import { orderDetailSortSelect } from './order-detail.response'
import { paymentMethodSelect } from './payment-method.response'

export const orderSortSelect: Prisma.OrderSelect = {
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
  paymentMethod: {
    select: paymentMethodSelect
  },
  creator: {
    select: accountSortSelect
  },
  orderDetails: {
    select: orderDetailSortSelect
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
  paymentMethod: {
    select: paymentMethodSelect
  },
  creator: {
    select: accountSortSelect
  },
  updater: {
    select: accountSortSelect
  },
  orderDetails: {
    select: orderDetailSortSelect
  },
  updatedAt: true,
  createdAt: true
}
