import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';

export class FindMeasurementUnitDTO {
  @Type(() => Number)
  skip?: number = 0;

  @Type(() => Number)
  take?: number = 10;

  @Type(() => Object)
  orderBy?: Prisma.MeasurementUnitOrderByWithRelationInput = {
    createdAt: 'desc',
  };
}
