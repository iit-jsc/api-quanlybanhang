import { Prisma } from '@prisma/client'
import { customerTypeSelect } from './customer-type.response'

export const customerSelect: Prisma.CustomerSelect = {
  id: true,
  name: true,
  discountFor: true,
  phone: true,
  address: true,
  isOrganize: true,
  birthday: true,
  description: true,
  discount: true,
  discountType: true,
  email: true,
  fax: true,
  tax: true,
  sex: true,
  representativeName: true,
  representativePhone: true,
  createdAt: true,
  updatedAt: true,
  customerType: {
    select: customerTypeSelect
  }
}
