import { IsNotEmpty, IsString } from 'class-validator';

export class AccessBranchDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string;
}
