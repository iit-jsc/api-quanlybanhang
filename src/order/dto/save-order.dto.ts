import { IsBoolean } from 'class-validator'

export class SaveOrderDto {
  note?: string

  @IsBoolean()
  isSave: boolean
}
