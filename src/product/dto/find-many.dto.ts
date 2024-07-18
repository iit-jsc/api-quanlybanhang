import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FindManyProductDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  branchId: string;

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
  measurementUnitIds: string[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  productTypeIds: string[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(",")
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  statuses?: number[];
}
