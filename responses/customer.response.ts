import { Prisma } from '@prisma/client'
import { customerTypeSelect } from './customer-type.response'

export const customerSelect: Prisma.CustomerSelect = {
  id: true,
  code: true,
  organizeName: true,
  name: true,
  phone: true,
  address: true,
  isOrganize: true,
  birthday: true,
  description: true,
  email: true,
  tax: true,
  sex: true,
  createdAt: true,
  updatedAt: true,
  customerType: {
    select: customerTypeSelect
  }
}
