import { Prisma } from '@prisma/client'
import { branchSortSelect } from './branch.response'

export const shopLoginSelect = (id: string): Prisma.ShopSelect => ({
  id: true,
  name: true,
  code: true,
  photoURL: true,
  address: true,
  email: true,
  phone: true,
  branches: {
    select: branchSortSelect,
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
