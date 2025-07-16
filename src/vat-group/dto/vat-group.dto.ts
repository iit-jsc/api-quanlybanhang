import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString, IsNumber, MaxLength, Min, Max } from 'class-validator'

export class CreateVatGroupDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MaxLength(20)
  name: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate: number
}

export class UpdateVatGroupDto extends PartialType(CreateVatGroupDto) {}
