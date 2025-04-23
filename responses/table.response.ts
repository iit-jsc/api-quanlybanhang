import { Prisma } from '@prisma/client'
import { orderDetailSelect } from './order-detail.response'

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
    select: orderDetailSelect
  }
}
