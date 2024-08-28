import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BRANCH_STATUS } from "enums/shop.enum";
import { AnyObject } from "interfaces/common.interface";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class CreateBranchDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  photoURL?: string;

  @IsOptional()
  bannerURL?: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(BRANCH_STATUS, { message: "Trạng thái không hợp lệ!" })
  status?: number;

  @IsOptional()
  others: AnyObject;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone: string;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
