import { Prisma } from '@prisma/client'
import { accountShortSelect } from './account.response'
import { orderDetailShortSelect } from './order-detail.response'
import { paymentMethodSelect } from './payment-method.response'

export const orderSelect: Prisma.OrderSelect = {
  id: true,
  code: true,
  status: true,
  type: true,
  isPaid: true,
  voucherValue: true,
  voucherProducts: true,
  discountCodeValue: true,
  orderTotal: true,
  moneyReceived: true,
  customerDiscountValue: true,
  isSave: true,
  note: true,
  bankingImages: true,
  table: {
    select: {
      id: true,
      name: true,
      seat: true,
      updatedAt: true,
      area: {
        select: {
          id: true,
          name: true,
          photoURL: true
        }
      }
    }
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
