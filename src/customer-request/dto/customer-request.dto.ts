import { PartialType } from "@nestjs/swagger";
import {
	IsEnum,
	IsNotEmpty,
	IsString,
} from "class-validator";
import { REQUEST_TYPE } from "enums/common.enum";

export class CreateCustomerRequestDto {
	@IsNotEmpty({ message: "Không được để trống!" })
	@IsString()
	tableId: string;

	@IsNotEmpty({ message: "Không được để trống!" })
	@IsString()
	branchId: string;

	@IsNotEmpty({ message: "Không được để trống!" })
	@IsEnum(REQUEST_TYPE)
	requestType: string;


	content?: string;

	isCompleted?: boolean;
}

export class UpdateCustomerRequestDto extends PartialType(CreateCustomerRequestDto) { }
