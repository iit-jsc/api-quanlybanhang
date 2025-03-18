import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateProductTypeDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  slug: string

  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateProductTypeDto extends PartialType(CreateProductTypeDto) {}

export class FindManyProductTypeDto extends FindManyDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string
}
