import { IsNotEmpty } from "class-validator";

export class FindByCodeDto {
  @IsNotEmpty()
  code: string;
}