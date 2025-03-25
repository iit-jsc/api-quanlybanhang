import { Prisma } from '@prisma/client'
import { accountSortSelect } from './account.response'
import { orderDetailSelect } from './order-detail.response'
import { paymentMethodSelect } from './payment-method.response'

export const orderSelect: Prisma.OrderSelect = {
  id: true,
  code: true,
  bankingImages: true,
  isPaid: true,
  discountCodeValue: true,
  customerDiscountValue: true,
  isSave: true,
  note: true,
  type: true,
  status: true,
  paymentMethod: {
    select: paymentMethodSelect
  },
  creator: {
    select: accountSortSelect
  },
  orderDetails: {
    select: orderDetailSelect
  },
  updatedAt: true,
  createdAt: true
}
