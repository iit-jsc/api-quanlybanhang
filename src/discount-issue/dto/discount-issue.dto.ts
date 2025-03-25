import { PartialType } from '@nestjs/swagger'
import { DiscountType } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsOptional, Max, MinDate, ValidateIf } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateDiscountIssueDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsNotEmpty()
  @ValidateIf(o => o.discountType === DiscountType.PERCENT)
  @Max(100)
  discount: number

  @ValidateIf(o => o.isLimit === true)
  @IsNotEmpty()
  amount: number

  @IsNotEmpty()
  isLimit: boolean

  @IsNotEmpty()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  startDate: Date

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date())
  endDate: Date

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string

  description?: string
  minTotalOrder?: number
  maxValue?: number
}

export class UpdateDiscountIssueDto extends PartialType(CreateDiscountIssueDto) {}

export class findUniqByDiscountCodeDto {
  @IsNotEmpty()
  branchId: string

  @IsNotEmpty()
  code: string
}

export class FindManyDiscountIssueDto extends FindManyDto {
  @Type(() => Number)
  totalOrder?: number
}
