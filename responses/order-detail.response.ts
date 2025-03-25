import { Prisma } from '@prisma/client'

export const orderDetailSelect: Prisma.OrderDetailSelect = {
  id: true,
  amount: true,
  note: true,
  status: true,
  product: true,
  productOptions: true,
  updatedAt: true,
  createdAt: true
}
