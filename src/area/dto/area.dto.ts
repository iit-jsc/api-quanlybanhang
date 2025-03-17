import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateAreaDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsOptional()
  photoURL?: string
}

export class FindManyAreaDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  areaIds: string[]

  @IsOptional()
  tableKeyword?: string
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
