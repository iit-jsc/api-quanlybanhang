import { Transform, TransformFnParams, Type } from "class-transformer";
import { ArrayNotEmpty, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { FIND_UNIQ_TYPE } from "enums/common.enum";

export class FindManyDto {
  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Type(() => String)
  keyword?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  branchIds: string[];

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isSort?: boolean;

  /* ====== group role filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => +id.trim());
  })
  types: number[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",");
  })
  employeeGroupIds: string[];

  /* ====== table filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  areaIds: string[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  customerTypeIds: string[];

  /* ====== order status filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  businessTypeIds: string[];

  /* ====== order  filter  ====== */

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  orderTypes: number[];

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isPaid?: boolean;

  /* ====== table  filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  statusOrderDetails: number[];

  /* ====== warehouse filter  ====== */

  @IsOptional()
  @IsString()
  productId: string;

  /* ====== shop filter  ====== */

  @IsOptional()
  @IsString()
  code: string;

  /* ====== shop filter  ====== */

  @IsOptional()
  @IsString()
  domains: string[];

  /* ====== employee schedule filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  employeeIds: string[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  workShiftIds: string[];

  /* ====== compensation setting filter  ====== */

  @Transform(({ value }: TransformFnParams) => (value === undefined ? value : Boolean(+value)))
  isFulltime?: boolean;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: number) => +id);
  })
  applyTos: number[];
}

export class FindBySlugDto {
  @IsNotEmpty()
  @IsString()
  branchId: string;
}

export class DeleteManyDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách ids!" })
  ids: string[];
}

export class DeleteManyWithIdentifierDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách identifier không được rỗng!" })
  identifiers: string[];

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách chi nhánh không được rỗng!" })
  branchIds: string[];
}

export class FindUniqDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) => {
    return +value;
  })
  type: number = FIND_UNIQ_TYPE.ID;
}
