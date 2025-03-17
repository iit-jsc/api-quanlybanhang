import { Prisma } from '@prisma/client'
import { orderDetailSelect } from './order-detail.response'

export const tableSortSelect: Prisma.TableSelect = {
  id: true,
  name: true,
  seat: true,
  updatedAt: true,
  orderDetails: {
    select: orderDetailSelect
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
      productOptions: true
    }
  },
  updatedAt: true
}
