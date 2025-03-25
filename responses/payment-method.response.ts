import { Prisma } from '@prisma/client'

export const paymentMethodSelect: Prisma.PaymentMethodSelect = {
  id: true,
  bankCode: true,
  bankName: true,
  photoURL: true,
  representative: true,
  type: true,
  updatedAt: true
}
