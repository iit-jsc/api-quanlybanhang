import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateBranchDto } from 'src/branch/dto/create-branch.dto';
import { CreateUserDto } from 'src/user/dto/create-user-dto';

export class CreateShopDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  businessTypeId: number;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin chi nhánh!' })
  @ValidateNested()
  @Type(() => CreateBranchDto)
  branch: CreateBranchDto;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin người dùng!' })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
