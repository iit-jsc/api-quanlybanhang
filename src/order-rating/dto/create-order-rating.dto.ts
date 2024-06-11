import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderRatingDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  orderId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  ratingValue: number;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  photoURLs: string[];
}
