import { Transform, TransformFnParams, Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { AnyObject } from 'interfaces/common.interface'
import { FindManyDto } from 'utils/Common.dto'

export class FindManyProductTypeDto extends FindManyDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string
}
