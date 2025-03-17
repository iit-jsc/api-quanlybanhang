import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class RegisterScheduleDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  workShiftId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: 'Ngày tháng phải lớn hơn hoặc bằng ngày hiện tại!'
  })
  date: Date
}

export class FindManyEmployeeScheduleDto extends FindManyDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date

  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  employeeIds?: string[]

  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  workShiftIds?: string[]
}

export class FindManyEmployeeDto extends FindManyDto {}

export class UpdateRegisterScheduleDto extends PartialType(
  RegisterScheduleDto
) {}
