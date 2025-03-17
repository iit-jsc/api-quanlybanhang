import { Prisma } from '@prisma/client'

export const userSortSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  code: true,
  photoURL: true,
  phone: true,
  email: true
}
