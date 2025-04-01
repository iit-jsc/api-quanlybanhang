import { Prisma } from '@prisma/client'

export const roleSortSelect: Prisma.RoleSelect = {
  id: true,
  name: true,
  description: true
}

export const roleSelect: Prisma.RoleSelect = {
  id: true,
  name: true,
  description: true,
  permissions: {
    select: {
      code: true,
      name: true
    }
  }
}
