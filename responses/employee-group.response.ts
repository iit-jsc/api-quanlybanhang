import { Prisma } from '@prisma/client'

export const employeeGroupSelect: Prisma.EmployeeGroupSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true
}
