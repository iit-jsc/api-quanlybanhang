import { Prisma } from '@prisma/client'
import { roleSelect } from './role.response'
import { branchSortSelect } from './branch.response'

export const userSortSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  code: true,
  photoURL: true,
  phone: true,
  email: true
}

export const userSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  code: true,
  phone: true,
  email: true,
  address: true,
  cardId: true,
  cardDate: true,
  cardAddress: true,
  birthday: true,
  sex: true,
  startDate: true,
  photoURL: true,
  updatedAt: true,
  employeeGroup: {
    select: {
      id: true,
      name: true
    }
  },
  account: {
    select: {
      status: true,
      branches: {
        select: branchSortSelect
      },
      role: {
        select: roleSelect
      }
    }
  }
}
