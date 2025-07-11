import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'
import { FIND_UNIQ_TYPE } from 'enums/common.enum'
import { AnyObject } from 'interfaces/common.interface'

export class FindBySlugDto {
  @IsNotEmpty()
  branchId: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value)
  })
  isSlug: boolean = false
}

export class DeleteManyDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách ids!' })
  ids: string[]
}

export class DeleteManyWithIdentifierDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách identifier không được rỗng!' })
  identifiers: string[]

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách chi nhánh không được rỗng!' })
  branchIds: string[]
}

export class FindUniqDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) => {
    return +value
  })
  type: number = FIND_UNIQ_TYPE.ID

  @IsOptional()
  @IsString()
  shopId: string

  @IsOptional()
  @IsString()
  branchId: string
}

export class FindManyDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage: number

  @Transform(({ value }) => {
    if (value) {
      const [field, direction] = value.split('_')
      if (field && direction) {
        return { [field]: direction }
      }
    }
    return { createdAt: 'desc' }
  })
  orderBy?: AnyObject

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Type(() => String)
  keyword?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    return new Date(date.setHours(0, 0, 0, 0))
  })
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    return new Date(date.setHours(23, 59, 59, 999))
  })
  to?: Date

  @Transform(({ value }) => value ?? 'createdAt')
  filterBy: string = 'createdAt'
}
