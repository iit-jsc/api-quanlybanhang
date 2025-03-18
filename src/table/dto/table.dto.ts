import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
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

export class UpdateTableDto extends PartialType(CreateTableDto) {}
