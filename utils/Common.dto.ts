import { Transform, TransformFnParams, Type } from 'class-transformer';
import { ArrayNotEmpty, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

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
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  branchIds: number[];

  /* ====== employee filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  employeeGroupIds: number[];

  /* ====== product filter  ====== */

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  measurementUnitIds: number[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  productTypeIds: number[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  statuses?: number[];

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isCombo?: boolean;

  /* ====== table filter  ====== */
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  areaIds: number[];

  /* ====== employee filter  ====== */
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  customerTypeIds: number[];

  /* ====== order status filter  ====== */
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  businessTypeIds: number[];

  /* ====== order  filter  ====== */
  @Type(() => Number)
  customerId?: number;

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
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  orderTypes: number[];

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isPaid?: boolean;

  /* ====== table  filter  ====== */
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  statusOrderDetails: number[];
}

export class DeleteManyDto {
  ids: number[];
}

export class DeleteManyWithIdentifierDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách identifier không được rỗng!' })
  identifiers: string[];

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách chi nhánh không được rỗng!' })
  branchIds: number[];
}
