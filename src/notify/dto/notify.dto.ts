import { PartialType } from '@nestjs/swagger'
import { NotifyType, Prisma } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class CreateNotifyDto {
  targetName?: string

  @IsNotEmpty()
  modelName: Prisma.ModelName

  @IsNotEmpty()
  branchId: string

  @IsNotEmpty()
  @IsEnum(NotifyType)
  type: NotifyType
}

export class UpdateNotifyDto extends PartialType(CreateNotifyDto) {}
