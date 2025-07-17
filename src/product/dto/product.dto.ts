import { PartialType } from '@nestjs/swagger'
import { ProductStatus } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
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
  @IsString()
  productTypeId: string

  @IsNotEmpty()
  @IsString()
  unitId: string

  @IsOptional()
  @IsArray()
  photoURLs: string[]

  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  price: number

  @IsNotEmpty()
  @IsBoolean()
  hasVat: boolean = false

  @IsOptional()
  @IsString()
  vatGroupId: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice: number

  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug: string

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsString()
  thumbnail: string

  @IsOptional()
  @IsString()
  code: string
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
