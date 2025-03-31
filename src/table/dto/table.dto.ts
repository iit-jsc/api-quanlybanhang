import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { ArrayNotEmpty, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { CreateOrderProductsDto } from 'src/order/dto/order.dto'
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

export class AddDishDto {
  @IsNotEmpty()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductsDto)
  orderProducts: CreateOrderProductsDto[]
}

export class AddDishByCustomerDto extends AddDishDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}
