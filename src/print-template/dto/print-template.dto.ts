import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdatePrintTemplateDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  type: number;

  @IsOptional()
  @IsNumber()
  content: string;
}
