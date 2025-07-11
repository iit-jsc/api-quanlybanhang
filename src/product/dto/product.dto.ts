import { PartialType } from '@nestjs/swagger'
import { ProductStatus } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateProductDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(255)
  name: string

  @IsNotEmpty()
  productTypeId: string

  @IsNotEmpty()
  unitId: string

  @IsOptional()
  @IsArray()
  photoURLs: string[]

  @IsNotEmpty()
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice: number

  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus

  slug?: string
  description?: string
  thumbnail?: string
  code?: string
}

export class FindManyProductDto extends FindManyDto {
  @IsNotEmpty()
  @IsString()
  branchId: string

  @Type(() => String)
  keyword?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  measurementUnitIds: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  productTypeIds: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: ProductStatus) => id.trim())
  })
  statuses?: ProductStatus[]
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
