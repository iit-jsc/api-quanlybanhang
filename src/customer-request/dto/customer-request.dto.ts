import { PartialType } from "@nestjs/swagger";
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";
import { REQUEST_STATUS, REQUEST_TYPE } from "enums/common.enum";

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

	@IsOptional()
	@IsEnum(REQUEST_STATUS, { message: "Trạng thái không hợp lệ!" })
	status: string;
}

export class UpdateCustomerRequestDto extends PartialType(CreateCustomerRequestDto) { }
