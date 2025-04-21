import { Prisma } from '@prisma/client'
import { accountSortSelect } from './account.response'

export const orderDetailSortSelect: Prisma.OrderDetailSelect = {
  id: true,
  amount: true,
  note: true,
  status: true,
  product: true,
  productOptions: true,
  updatedAt: true,
  createdAt: true
}

export const orderDetailSelect: Prisma.OrderDetailSelect = {
  id: true,
  product: true,
  status: true,
  note: true,
  amount: true,
  productOptions: true,
  canceledOrderDetails: {
    select: {
      id: true,
      amount: true,
      cancelReason: true,
      createdAt: true,
      creator: {
        select: accountSortSelect
      }
    }
  },
  tableId: true,
  table: {
    select: {
      id: true,
      name: true,
      seat: true,
      area: {
        select: {
          id: true,
          name: true,
          photoURL: true
        }
      }
    }
  },
  order: {
    select: {
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
      updatedAt: true,
      createdAt: true,
      table: {
        select: {
          id: true,
          name: true,
          seat: true,
          area: {
            select: {
              id: true,
              name: true,
              photoURL: true
            }
          }
        }
      }
    }
  },
  updatedAt: true,
  createdAt: true,
  creator: {
    select: accountSortSelect
  },
  updater: {
    select: accountSortSelect
  }
}
