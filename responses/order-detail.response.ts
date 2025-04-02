import { Prisma } from '@prisma/client'

export const orderDetailSortSelect: Prisma.OrderDetailSelect = {
  id: true,
  amount: true,
  note: true,
  status: true,
  product: true,
  productOptions: true,
  updatedAt: true,
  createdAt: true
}

export const orderDetailSelect: Prisma.OrderDetailSelect = {
  id: true,
  product: true,
  status: true,
  note: true,
  amount: true,
  productOptions: true,
  table: {
    select: {
      id: true,
      name: true,
      seat: true,
      area: {
        select: {
          id: true,
          name: true,
          photoURL: true
        }
      }
    }
  },
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
  updatedAt: true,
  createdAt: true
}
