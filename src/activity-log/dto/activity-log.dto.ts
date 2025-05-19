import { ActivityAction, Prisma } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateActivityLogDto {
  @IsEnum(ActivityAction)
  action: ActivityAction

  @IsNotEmpty()
  modelName: Prisma.ModelName

  targetId?: string
  targetName?: string
  relatedName?: string
  relatedModel?: Prisma.ModelName
}

export class FindManyActivityLogDto extends FindManyDto {}
