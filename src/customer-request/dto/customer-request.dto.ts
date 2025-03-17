import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { REQUEST_STATUS, REQUEST_TYPE } from 'enums/common.enum'
import { FindManyDto } from 'utils/Common.dto'

export class CreateCustomerRequestDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  tableId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsEnum(REQUEST_TYPE)
  requestType: string

  content?: string

  @IsOptional()
  @IsEnum(REQUEST_STATUS, { message: 'Trạng thái không hợp lệ!' })
  status: string
}

export class FindManyCustomerRequestDto extends FindManyDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  branchId: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  requestTypes: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  tableIds: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  statuses: string[]
}

export class UpdateCustomerRequestDto extends PartialType(
  CreateCustomerRequestDto
) {}
