import { Transform, TransformFnParams } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  branchIds: number[];

  @IsArray()
  @IsOptional()
  roleIds: number[];
}
