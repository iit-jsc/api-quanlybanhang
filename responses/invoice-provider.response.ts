import { Prisma } from '@prisma/client'

export const invoiceProviderSelect: Prisma.InvoiceProviderSelect = {
  id: true,
  branchId: true,
  providerType: true,
  isActive: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  invConfig: {
    select: {
      id: true,
      invPattern: true,
      invSerial: true,
      updatedAt: true,
      vnptApiUrl: true,
      vnptAccount: true
    }
  }
}
