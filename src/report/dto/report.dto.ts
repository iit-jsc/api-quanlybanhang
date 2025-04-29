import { Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional } from 'class-validator'

export class ReportDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to: Date
}

export class ReportBestSellerDto extends ReportDto {}

export class ReportRevenueDto extends ReportDto {
  @IsOptional()
  @IsEnum(['day', 'month', 'year'])
  type: string = 'day'
}

export class ReportAmountDto extends ReportDto {
  @IsEnum(Prisma.ModelName)
  type: Prisma.ModelName
}
