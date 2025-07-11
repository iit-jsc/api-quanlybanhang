import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, MaxLength } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateProductTypeDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(255)
  name: string

  slug?: string
  description?: string
}

export class UpdateProductTypeDto extends PartialType(CreateProductTypeDto) {}

export class FindManyProductTypeDto extends FindManyDto {
  @IsNotEmpty()
  branchId: string
}
