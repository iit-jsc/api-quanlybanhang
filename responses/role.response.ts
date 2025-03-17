import { Prisma } from '@prisma/client'

export const roleSortSelect: Prisma.RoleSelect = {
  id: true,
  name: true,
  description: true
}
