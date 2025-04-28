import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional } from 'class-validator'

export class ReportProductDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to: Date
}

export class ReportRevenueDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to: Date

  @IsOptional()
  @IsEnum(['day', 'month', 'year'])
  type: string = 'day'
}
