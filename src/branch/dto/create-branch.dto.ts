import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateBranchDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone?: string

  address?: string
  photoURL?: string
  bannerURL?: string
}

export class CreateDataSampleDto {
  @IsNotEmpty()
  isAgreed: boolean
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
