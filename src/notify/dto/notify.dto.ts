import { PartialType } from '@nestjs/swagger'
import { NotifyType, Prisma } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class CreateNotifyDto {
  content?: string

  targetId?: string

  modelName?: Prisma.ModelName

  @IsNotEmpty()
  @IsEnum(NotifyType)
  type: NotifyType
}

export class UpdateNotifyDto extends PartialType(CreateNotifyDto) {}
