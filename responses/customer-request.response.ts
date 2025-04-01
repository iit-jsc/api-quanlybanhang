import { Prisma } from '@prisma/client'

export const customerRequestSelect: Prisma.CustomerRequestSelect = {
  id: true,
  content: true,
  status: true,
  requestType: true,
  createdAt: true,
  updatedAt: true,
  table: {
    select: {
      id: true,
      name: true,
      seat: true,
      area: {
        select: {
          id: true,
          name: true,
          photoURL: true,
          createdAt: true,
          updatedAt: true
        }
      },
      updatedAt: true
    }
  }
}
