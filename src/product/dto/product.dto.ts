import { PartialType } from '@nestjs/swagger'
import { ProductStatus } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateProductDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  slug: string

  @IsNotEmpty()
  productTypeId: string

  @IsNotEmpty()
  unitId: string

  @IsOptional()
  @IsArray()
  photoURLs: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice: number

  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus

  description?: string
  thumbnail?: string
  code?: string
}

export class FindManyProductDto extends FindManyDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
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
    return value?.split(',').map((id: string) => id.trim())
  })
  statuses?: ProductStatus[]
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
