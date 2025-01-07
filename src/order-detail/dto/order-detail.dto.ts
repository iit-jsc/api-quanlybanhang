import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsDate } from "class-validator";
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

    @Type(() => Date)
    @IsDate()
    from?: Date;

    @Type(() => Date)
    @IsDate()
    to?: Date;
}
