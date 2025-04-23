import { Prisma } from '@prisma/client'
import { AnyObject } from 'interfaces/common.interface'
import { DeleteManyDto, FindManyDto } from 'utils/common.dto'

export class FindManyTrashDto extends FindManyDto {
  categoryIds?: string[]
  orderKey?: string = 'deletedAt'
  orderValue?: string = 'desc'
}

export class DeleteManyTrashDto extends DeleteManyDto {}

export class CreateTrashDto {
  modelName: Prisma.ModelName
  accountId: string
  entity: AnyObject
}

export class CreateManyTrashDto {
  modelName: Prisma.ModelName
  accountId: string
  entities: AnyObject
}
