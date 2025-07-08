import { Prisma } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional } from 'class-validator'

export class ReportDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    return new Date(date.setHours(0, 0, 0, 0))
  })
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    return new Date(date.setHours(23, 59, 59, 999))
  })
  to?: Date
}

export class ReportBestSellerDto extends ReportDto {}

export class ReportRevenueDto extends ReportDto {
  @IsOptional()
  @IsEnum(['hour', 'day', 'month', 'year'])
  type: string = 'hour'
}

export class ReportAmountDto extends ReportDto {
  @IsEnum(Prisma.ModelName)
  type: Prisma.ModelName
}

export class ReportSummaryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return null
    }
    return date
  })
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return null
    }
    return date
  })
  to?: Date
}
