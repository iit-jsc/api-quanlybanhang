import { IsNotEmpty } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class FindManyOrderRatings extends FindManyDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  orderId: string
}
