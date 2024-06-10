import { IsBoolean, IsOptional } from 'class-validator';

export class SaveOrderDto {
  @IsOptional()
  note: string;

  @IsOptional()
  @IsBoolean()
  isSave: boolean;
}
