import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";
import { FindManyDto } from "utils/Common.dto";

export class FindManyActivityLogDto extends FindManyDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}