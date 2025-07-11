import { Prisma } from '@prisma/client'
import { accountShortSelect } from './account.response'

export const orderDetailShortSelect: Prisma.OrderDetailSelect = {
  id: true,
  amount: true,
  note: true,
  status: true,
  product: true,
  productOptions: true,
  updatedAt: true,
  createdAt: true,
  informAt: true,
  successAt: true,
  processingAt: true,
  branchId: true,
  createdBy: true,
  updatedBy: true,
  tableId: true,
  canceledOrderDetails: {
    select: {
      id: true,
      amount: true,
      cancelReason: true,
      createdAt: true,
      createdBy: true,
      creator: {
        select: accountShortSelect
      }
    }
  }
}

export const orderDetailSelect: Prisma.OrderDetailSelect = {
  id: true,
  product: true,
  status: true,
  note: true,
  amount: true,
  productOptions: true,
  informAt: true,
  successAt: true,
  processingAt: true,
  canceledOrderDetails: {
    select: {
      id: true,
      amount: true,
      cancelReason: true,
      createdAt: true,
      creator: {
        select: accountShortSelect
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
      paymentStatus: true,
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
    },
    where: {
      isDraft: false
    }
  },
  updatedAt: true,
  createdAt: true,
  creator: {
    select: accountShortSelect
  },
  updater: {
    select: accountShortSelect
  }
}
