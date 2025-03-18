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

export const accountJWTAuthSelect = (branchId: string): Prisma.AccountSelect => ({
  id: true,
  branches: {
    select: { id: true, shopId: true },
    where: { id: branchId }
  },
  role: {
    select: {
      permissions: {
        select: {
          code: true
        }
      }
    }
  }
})
