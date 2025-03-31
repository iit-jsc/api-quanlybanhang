import { Prisma } from '@prisma/client'

export const discountIssueSelect: Prisma.DiscountIssueSelect = {
  id: true,
  name: true,
  code: true,
  discountType: true,
  amount: true,
  discount: true,
  description: true,
  startDate: true,
  endDate: true,
  isLimit: true,
  maxValue: true,
  minOrderTotal: true,
  updatedAt: true,
  createdAt: true,
  _count: {
    select: {
      discountCodes: true
    }
  }
}
