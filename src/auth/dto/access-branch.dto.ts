import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccessBranchDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  branchId: number;
}
