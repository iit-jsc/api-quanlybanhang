import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";
import { FindManyDto } from "utils/Common.dto";

export class FindManyOrderDetailDto extends FindManyDto {
    @Transform(({ value }: TransformFnParams) => {
        return value?.split(",").map((id: number) => +id);
    })
    orderDetailStatuses?: number[];

    @Transform(({ value }: TransformFnParams) => {
        return value?.split(",").map((id: number) => +id);
    })
    orderTypes?: number[];

    @Transform(({ value }: TransformFnParams) => {
        return Boolean(+value);
    })
    hasTable?: boolean;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    from?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    to?: Date;
}
