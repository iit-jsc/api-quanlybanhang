import { Prisma } from '@prisma/client'
import { userShortSelect } from './user.response'

export const accountShortSelect: Prisma.AccountSelect = {
  id: true,
  status: true,
  user: {
    select: userShortSelect
  }
}

export const accountLoginSelect: Prisma.AccountSelect = {
  id: true,
  updatedAt: true,
  password: true,
  status: true,
  user: {
    select: userShortSelect
  }
}

export const accountJWTAuthSelect = (branchId: string): Prisma.AccountSelect => ({
  id: true,
  status: true,
  branches: {
    select: { id: true, shopId: true, expiryAt: true },
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
