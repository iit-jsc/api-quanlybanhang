import { Prisma } from '@prisma/client'
import { accountShortSelect } from './account.response'

export const tableSelect: Prisma.TableSelect = {
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
  },
  orderDetails: {
    select: {
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
          createdAt: true
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
    },
    orderBy: {
      createdAt: 'asc'
    }
  }
}
