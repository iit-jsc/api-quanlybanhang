import { Prisma } from '@prisma/client'

export const notifySelect: Prisma.NotifySelect = {
  id: true,
  type: true,
  content: true,
  createdAt: true
}
