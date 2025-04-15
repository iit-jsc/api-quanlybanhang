import { Prisma } from '@prisma/client'
import { userSortSelect } from './user.response'

export const accountSortSelect: Prisma.AccountSelect = {
  id: true,
  status: true,
  user: {
    select: userSortSelect
  }
}

export const accountLoginSelect: Prisma.AccountSelect = {
  id: true,
  updatedAt: true,
  password: true,
  user: {
    select: userSortSelect
  }
}

export const accountJWTAuthSelect = (branchId: string): Prisma.AccountSelect => ({
  id: true,
  branches: {
    select: { id: true, shopId: true },
    where: { id: branchId }
  },
  roles: {
    select: {
      id: true,
      name: true,
      permissions: {
        select: {
          code: true
        }
      }
    }
  }
})
