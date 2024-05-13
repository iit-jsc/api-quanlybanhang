import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { DEFAULT_OPTION_FIND } from 'enums/common.enum';

export class FindMeasurementUnitDTO {
  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @IsString()
  orderBy?: string = DEFAULT_OPTION_FIND.DEFAULT_ORDER;
}
