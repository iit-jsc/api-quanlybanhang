import { Prisma } from '@prisma/client'
import { discountIssueSelect } from './discountIssue.response'

export const discountCodeSelect: Prisma.DiscountCodeSelect = {
  id: true,
  code: true,
  isUsed: true,
  updatedAt: true,
  createdAt: true,
  discountIssue: {
    select: discountIssueSelect
  }
}
