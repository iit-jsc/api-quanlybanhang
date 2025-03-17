import { Transform, TransformFnParams } from 'class-transformer'
import { FindManyDto } from 'utils/Common.dto'

export class FindManyGroupRoleDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => +id.trim())
  })
  types?: number[]
}
