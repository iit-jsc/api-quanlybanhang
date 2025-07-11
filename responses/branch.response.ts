import { Prisma } from '@prisma/client'

export const branchShortSelect: Prisma.BranchSelect = {
  id: true,
  name: true,
  address: true,
  photoURL: true,
  expiryAt: true,
  phone: true,
  branchSetting: true
}
