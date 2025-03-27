import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional, Length, Max } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateDiscountCodeDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(0, 10)
  prefix: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(0, 10)
  suffixes: string

  @IsNotEmpty()
  discountIssueId: string

  @IsNotEmpty()
  @Max(50)
  amount: number
}

export class CheckAvailableDto {
  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  branchId: string

  @IsNotEmpty()
  totalOrder: number
}

export class FindManyDiscountCodeDto extends FindManyDto {
  @Transform(({ value }) => value?.toString().toLowerCase() === 'true')
  isUsed?: boolean

  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  discountIssueIds: string[]
}
