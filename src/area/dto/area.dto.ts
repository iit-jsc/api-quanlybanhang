import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateAreaDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(25)
  name: string

  photoURL?: string
}

export class FindManyAreaDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  areaIds: string[]
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
