import { Prisma } from '@prisma/client'

export const accountSortSelect: Prisma.AccountSelect = {
  id: true,
  password: true,
  status: true,
  user: {
    select: {
      id: true
    }
  },
  branches: true
}
