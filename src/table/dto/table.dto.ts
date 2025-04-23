import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { ArrayNotEmpty, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateTableDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  areaId: string

  seat?: number
}

export class FindManyTableDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  areaIds: string[]
}

export class AddDishItemDto {
  @IsNotEmpty()
  productId: string

  @IsNotEmpty()
  amount: number

  note?: string

  productOptionIds?: string[]
}

export class AddDishesDto {
  @IsNotEmpty()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddDishItemDto)
  orderProducts: AddDishItemDto[]
}

export class UpdateDishDto {
  @IsNotEmpty()
  productId: string

  @IsNotEmpty()
  @Min(1)
  amount: number

  note?: string

  productOptionIds?: string[]
}

export class AddDishesByCustomerDto extends AddDishesDto {
  @IsNotEmpty()
  @IsString()
  branchId: string
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}
