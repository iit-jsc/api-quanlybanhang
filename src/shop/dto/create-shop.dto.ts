import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateBranchDTO } from 'src/branch/dto/create-branch.dto';
import { CreateUserDTO } from 'src/user/dto/create-user-dto';

export class CreateShopDTO {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  businessTypeId: number;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin chi nhánh!' })
  @ValidateNested()
  @Type(() => CreateBranchDTO)
  branch: CreateBranchDTO;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin người dùng!' })
  @ValidateNested()
  @Type(() => CreateUserDTO)
  user: CreateUserDTO;
}
