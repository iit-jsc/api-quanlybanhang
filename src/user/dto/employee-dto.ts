import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ACCOUNT_STATUS, SEX_TYPE } from "enums/user.enum";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class CreateEmployeeDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: "Email không đúng định dạng.",
    },
  )
  email: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(SEX_TYPE, { message: "Giới tính không hợp lệ!" })
  sex: number;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: "Ngày tháng không hợp lệ!" })
  @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
  birthday: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: "Ngày tháng không hợp lệ!" })
  @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
  cardDate: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: "Ngày tháng không hợp lệ!" })
  @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
  startDate: Date;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  employeeGroupId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsArray()
  @ArrayNotEmpty({ message: "Không được để trống!" })
  permissionIds: string[];

  @IsOptional()
  @IsString()
  photoURL: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  cardId: string;

  @IsOptional()
  @IsString()
  cardAddress: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: "Không được là chuỗi rỗng!" })
  code: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  username: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 kí tự." })
  password: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 kí tự." })
  newPassword: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ACCOUNT_STATUS, { message: "Trạng thái không hợp lệ!" })
  accountStatus: number;
}

// import { Transform, TransformFnParams, Type } from "class-transformer";
// import {
//   IsArray,
//   IsDate,
//   IsEmail,
//   IsEnum,
//   IsNotEmpty,
//   IsNumber,
//   IsOptional,
//   IsString,
//   MaxDate,
//   MinLength,
// } from "class-validator";
// import { ACCOUNT_STATUS, SEX_TYPE } from "enums/user.enum";
// import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

// export class UpdateEmployeeDto {
//   @IsNotEmpty({ message: "Không được để trống!" })
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @IsString()
//   name: string;

//   @IsNotEmpty({ message: "Không được để trống!" })
//   @IsVietnamesePhoneNumber()
//   phone: string;

//   @IsOptional()
//   @IsEmail(
//     {},
//     {
//       message: "Email không đúng định dạng.",
//     },
//   )
//   email: string;

//   @IsOptional()
//   @Type(() => Number)
//   @IsEnum(SEX_TYPE, { message: "Giới tính không hợp lệ!" })
//   sex: number;

//   @IsOptional()
//   @Transform(({ value }) => value && new Date(value))
//   @IsDate({ message: "Ngày tháng không hợp lệ!" })
//   @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
//   birthday: Date;

//   @IsOptional()
//   @Transform(({ value }) => value && new Date(value))
//   @IsDate({ message: "Ngày tháng không hợp lệ!" })
//   @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
//   cardDate: Date;

//   @IsOptional()
//   @Transform(({ value }) => value && new Date(value))
//   @IsDate({ message: "Ngày tháng không hợp lệ!" })
//   @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
//   startDate: Date;

//   @IsOptional()
//   @IsString()
//   employeeGroupId: string;

//   @IsOptional()
//   @IsArray()
//   permissionIds: string[];

//   @IsOptional()
//   @IsString()
//   photoURL: string;

//   @IsOptional()
//   @IsString()
//   address: string;

//   @IsOptional()
//   @IsString()
//   cardId: string;

//   @IsOptional()
//   @IsString()
//   cardAddress: string;

//   @IsOptional()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @IsNotEmpty({ message: "Không được là chuỗi rỗng!" })
//   code: string;

// }
