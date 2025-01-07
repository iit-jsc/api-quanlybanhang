import { PartialType } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  INVENTORY_TRANSACTION_STATUS,
  INVENTORY_TRANSACTION_TYPE,
} from 'enums/common.enum';
import { FindManyDto } from 'utils/Common.dto';

export class CreateInventoryTransactionDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(INVENTORY_TRANSACTION_STATUS, { message: 'Trạng thái không hợp lệ!' })
  status: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsString()
  supplierId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(INVENTORY_TRANSACTION_TYPE, { message: 'Loại không hợp lệ!' })
  type: number;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Không được là chuỗi rỗng!' })
  code: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  importWarehouse: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  importAddress: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  importOrderCode: string;

  @ArrayNotEmpty({ message: 'Danh sách không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => InventoryTransactionDetailDto)
  inventoryTransactionDetails: InventoryTransactionDetailDto[];
}

export class UpdateInventoryTransactionDto extends PartialType(
  CreateInventoryTransactionDto,
) {}

export class InventoryTransactionDetailDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  documentQuantity: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  actualQuantity: number;
}

export class FindManInventTransDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => +id.trim());
  })
  types?: number[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
