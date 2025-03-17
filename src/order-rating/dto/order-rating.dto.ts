import { PartialType } from '@nestjs/swagger'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateOrderRatingDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  orderId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  ratingValue: number

  @IsOptional()
  @IsString()
  comment: string

  @IsOptional()
  @IsArray()
  photoURLs: string[]
}

export class UpdateOrderRatingDto extends PartialType(CreateOrderRatingDto) {}
