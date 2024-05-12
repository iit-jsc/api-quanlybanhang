import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccessBranchDTO {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  branchId: number;
}
