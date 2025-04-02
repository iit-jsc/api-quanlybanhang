import { PartialType } from '@nestjs/swagger'
import { ProductOptionType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateProductOptionGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @ValidateNested({ each: true })
  productOptions: CreateProductOptionDto[]

  isMultiple?: boolean
  isRequired?: boolean
}

export class CreateProductOptionDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEnum(ProductOptionType)
  type: ProductOptionType

  @IsOptional()
  @Min(0)
  price: number

  @IsOptional()
  @IsArray()
  productIds?: string[]

  isDefault?: boolean
  photoURL?: string
}

export class FindManyProductOptionGroupDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  productTypeIds?: string[]

  @IsNotEmpty()
  branchId: string

  productId?: string
}

export class UpdateProductOptionGroupDto extends PartialType(CreateProductOptionGroupDto) {}
