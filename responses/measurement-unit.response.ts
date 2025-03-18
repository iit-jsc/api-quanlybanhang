import { Prisma } from '@prisma/client'

export const measurementUnitSelect: Prisma.MeasurementUnitSelect = {
  id: true,
  name: true,
  code: true,
  updatedAt: true
}
