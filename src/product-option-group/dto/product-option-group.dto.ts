import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
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

  @IsOptional()
  @Min(0)
  price: number

  isAppliedToAll?: boolean
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
