import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { CheckUniqDto, CreateUserDto, UpdateUserDto } from './dto/user.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { ChangeMyInformation } from 'src/auth/dto/change-information.dto'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.create)
  create(@Body() data: CreateUserDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req
    return this.userService.create(data, accountId, shopId)
  }

  @Patch('/me')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.updateMyInformation)
  changeInformation(@Body() data: ChangeMyInformation, @Req() req: RequestJWT) {
    const { accountId } = req

    return this.userService.uploadMyInformation(data, accountId)
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.update)
  update(@Param('id') id: string, @Body() data: UpdateUserDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.userService.update(id, data, accountId, shopId)
  }

  @Post('/check-exists')
  @HttpCode(HttpStatus.OK)
  checkExists(@Body() checkExistsDto: CheckUniqDto) {
    return this.userService.checkExists(checkExistsDto)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.delete)
  deleteManyEmployee(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.userService.deleteMany(data, accountId, shopId)
  }
}
