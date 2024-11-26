import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxDate,
  Validate,
  ValidateIf,
} from "class-validator";
import { DISCOUNT_TYPE } from "enums/common.enum";
import { ENDOW_TYPE, SEX_TYPE } from "enums/user.enum";
import { DiscountConstraint, IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class CreateCustomerDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  customerTypeId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Không được là chuỗi rỗng!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsBoolean()
  isOrganize: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  representativeName: string;

  @IsOptional()
  @IsString()
  representativePhone: string;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: "Ngày tháng không hợp lệ!" })
  @MaxDate(new Date(), { message: "Ngày tháng phải nhỏ hơn ngày hiện tại!" })
  birthday: Date;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  @IsEnum(ENDOW_TYPE, { message: "Endow không hợp lệ!" })
  endow: number;

  @ValidateIf((o) => o.endow === ENDOW_TYPE.BY_CUSTOMER)
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  @Validate(DiscountConstraint)
  discount: number;

  @ValidateIf((o) => o.endow === ENDOW_TYPE.BY_CUSTOMER)
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  @IsEnum(DISCOUNT_TYPE, { message: "Loại giảm giá không hợp lệ!" })
  discountType: number;

  @IsOptional()
  @IsNumber()
  @IsEnum(SEX_TYPE, { message: "Giới tính không hợp lệ!" })
  sex: number;

  @IsOptional()
  @IsString()
  fax: string;

  @IsOptional()
  @IsString()
  tax: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class CheckEmailDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsVietnamesePhoneNumber()
  phone: string;


  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string;


  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shopId: string;
}
