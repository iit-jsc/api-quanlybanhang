import { PartialType } from '@nestjs/swagger'
import { RequestStatus, RequestType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateCustomerRequestDto {
  @IsNotEmpty()
  tableId: string

  @IsNotEmpty()
  branchId: string

  @IsNotEmpty()
  @IsEnum(RequestType)
  requestType: RequestType

  content?: string

  @IsOptional()
  @IsEnum(RequestStatus)
  status: RequestStatus
}

export class FindManyCustomerRequestDto extends FindManyDto {
  @IsNotEmpty()
  branchId: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: RequestType) => id.trim())
  })
  requestTypes: RequestType[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  tableIds: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: RequestStatus) => id.trim())
  })
  statuses: RequestStatus[]
}

export class FindUniqCustomerRequestDto {
  @IsNotEmpty()
  branchId: string
}

export class UpdateCustomerRequestDto extends PartialType(CreateCustomerRequestDto) {}
