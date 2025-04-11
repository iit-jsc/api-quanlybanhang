import { Prisma } from '@prisma/client'

export const notifySelect: Prisma.NotifySelect = {
  id: true,
  type: true,
  targetName: true,
  createdAt: true
}
