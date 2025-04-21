import { Prisma } from '@prisma/client'
import { orderDetailSortSelect } from './order-detail.response'
import { accountSortSelect } from './account.response'

export const tableSortSelect: Prisma.TableSelect = {
  id: true,
  name: true,
  seat: true,
  updatedAt: true,
  orderDetails: {
    select: orderDetailSortSelect
  }
}

export const tableSelect: Prisma.TableSelect = {
  id: true,
  name: true,
  seat: true,
  areaId: true,
  area: {
    select: {
      id: true,
      name: true,
      photoURL: true
    }
  },
  orderDetails: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      amount: true,
      note: true,
      status: true,
      createdAt: true,
      product: true,
      productOptions: true,
      tableId: true,
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
      creator: {
        select: accountSortSelect
      },
      updater: {
        select: accountSortSelect
      }
    }
  },
  updatedAt: true
}
