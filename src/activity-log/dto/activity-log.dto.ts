import { ActivityAction, Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
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

export class FindManyActivityLogDto extends FindManyDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date
}
