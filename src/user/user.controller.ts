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
import { CheckUniqDto, CreateUserDto, FindManyUserDto, UpdateUserDto } from './dto/user.dto'
import { DeleteManyDto } from 'utils/Common.dto'
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

  @Delete('my-account')
  @HttpCode(HttpStatus.OK)
  deleteMyAccount(@Req() req: RequestJWT) {
    const { accountId } = req

    return this.userService.deleteMyAccount(accountId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.user.delete)
  deleteManyEmployee(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.userService.deleteMany(data, accountId, shopId)
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
