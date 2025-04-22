import { Prisma } from '@prisma/client'
import { branchShortSelect } from './branch.response'

export const shopLoginSelect = (id: string): Prisma.ShopSelect => ({
  id: true,
  name: true,
  code: true,
  photoURL: true,
  address: true,
  email: true,
  phone: true,
  branches: {
    select: branchShortSelect,
    where: {
      accounts: {
        some: {
          id: id
        }
      }
    }
  },
  businessType: true
})
