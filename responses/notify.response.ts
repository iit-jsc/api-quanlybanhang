import { Prisma } from '@prisma/client'

export const notifySelect: Prisma.NotifySelect = {
  id: true,
  type: true,
  order: {
    select: {
      id: true,
      code: true,
      status: true,
      type: true,
      isPaid: true,
      voucherValue: true,
      voucherProducts: true,
      discountCodeValue: true,
      customerDiscountValue: true,
      isSave: true,
      note: true,
      bankingImages: true,
      updatedAt: true,
      createdAt: true
    }
  },
  table: {
    select: {
      id: true,
      name: true,
      seat: true,
      updatedAt: true
    }
  },
  customerRequest: {
    select: {
      id: true,
      content: true,
      status: true,
      requestType: true,
      createdAt: true,
      updatedAt: true,
      table: {
        select: {
          id: true,
          name: true,
          seat: true,
          area: {
            select: {
              id: true,
              name: true,
              photoURL: true,
              createdAt: true,
              updatedAt: true
            }
          },
          updatedAt: true
        }
      }
    }
  },
  createdAt: true
}
