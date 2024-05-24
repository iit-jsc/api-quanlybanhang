import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BRANCH_STATUS } from 'enums/branch.enum';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  address?: string;

  @IsOptional()
  photoURL?: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(BRANCH_STATUS, { message: 'Trạng thái không hợp lệ!' })
  status?: number;
}
