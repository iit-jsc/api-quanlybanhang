import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAreaDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  photoURL?: string;
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) { }
