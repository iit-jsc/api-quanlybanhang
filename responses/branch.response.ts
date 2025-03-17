import { Prisma } from '@prisma/client'

export const branchSortSelect: Prisma.BranchSelect = {
  id: true,
  name: true,
  address: true,
  photoURL: true
}
