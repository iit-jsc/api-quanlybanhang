import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import {
  CheckUniqUserDto,
  CreateUserDto,
  FindManyUserDto,
  UpdateUserDto,
  BlockUsersDto
} from './dto/user.dto'
import { ChangeMyInformation } from 'src/auth/dto/change-information.dto'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

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

  @Patch('/block')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.delete)
  blockUsers(@Body() data: BlockUsersDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.userService.blockUsers(data, shopId, accountId)
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.update)
  update(@Param('id') id: string, @Body() data: UpdateUserDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.userService.update(id, data, accountId, shopId)
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  deleteMyAccount(@Req() req: RequestJWT) {
    const { accountId } = req

    return this.userService.deleteMyAccount(accountId)
  }

  @Get('/check-valid-field')
  @HttpCode(HttpStatus.OK)
  checkValidField(@Query() data: CheckUniqUserDto, @Req() req: RequestJWT) {
    const { shopId } = req
    return this.userService.checkValidField(data, shopId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.user))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.userService.findUniq(id, shopId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.user))
  findAll(@Query() data: FindManyUserDto, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.userService.findAll(data, shopId)
  }
}
