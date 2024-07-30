import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class ReportSaleDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}

export class ReportCustomerDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to: Date;
}

export class ReportProductDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to: Date;
}
