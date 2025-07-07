import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { ArrayNotEmpty, IsNotEmpty, IsString, ValidateNested, IsNumber, Min } from 'class-validator'
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
  @IsNumber()
  @Min(1)
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

export class addDishDto {
  @IsNotEmpty()
  productId: string

  isNewLine?: boolean = false

  note?: string

  productOptionIds?: string[]
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}
