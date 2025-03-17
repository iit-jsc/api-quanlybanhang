import { Prisma } from '@prisma/client'
import { orderDetailSelect } from './order-detail.response'

export const tableSelect: Prisma.TableSelect = {
  id: true,
  name: true,
  seat: true,
  updatedAt: true,
  orderDetails: {
    select: orderDetailSelect
  }
}
