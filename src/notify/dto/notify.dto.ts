import { PartialType } from '@nestjs/swagger'
import { NotifyType } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class CreateNotifyDto {
  content?: string

  @IsNotEmpty()
  branchId: string

  @IsNotEmpty()
  @IsEnum(NotifyType)
  type: NotifyType
}

export class UpdateNotifyDto extends PartialType(CreateNotifyDto) {}
