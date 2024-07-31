import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";
import { REPORT_REVENUE_TYPE, TIME_TYPE } from "enums/common.enum";

export class reportRevenueDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to: Date;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Type(() => Number)
  @IsNumber()
  type: number;

  @ValidateIf((o) => o.type === REPORT_REVENUE_TYPE.TOTAL_REVENUE)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Type(() => Number)
  @IsNumber()
  timeType: number;

  @ValidateIf((o) => o.timeType === TIME_TYPE.HOUR)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Type(() => Number)
  @IsNumber()
  hourStart: number;

  @ValidateIf((o) => o.timeType === TIME_TYPE.HOUR)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Type(() => Number)
  @IsNumber()
  hourEnd: number;
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

export class ReportProductDto {}

export class ReportWareHouseDto {}

export class ReportEmployeeDto {}
