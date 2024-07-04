import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SHOP_STATUS } from 'enums/shop.enum';
import { CreateBranchDto } from 'src/branch/dto/create-branch.dto';
import { CreateUserDto } from 'src/user/dto/create-user-dto';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class RegisterShopDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  businessTypeCode: string;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin chi nhánh!' })
  @ValidateNested()
  @Type(() => CreateBranchDto)
  branch: CreateBranchDto;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin người dùng!' })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}

export class CreateShopDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  businessTypeCode: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  photoURL: string;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin chi nhánh!' })
  @ValidateNested()
  @Type(() => CreateBranchDto)
  branch: CreateBranchDto;

  @IsOptional()
  @IsNumber()
  @IsEnum(SHOP_STATUS, { message: 'Trạng thái không hợp lệ!' })
  status: number;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng.',
    },
  )
  email: string;
}
