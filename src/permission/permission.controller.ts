import { Controller } from '@nestjs/common'
import { PermissionService } from './permission.service'
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_PERMISSION', SPECIAL_ROLE.MANAGER)
  // create(@Body() createPermissionDto: CreatePermissionDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.permissionService.create(createPermissionDto, tokenPayload)
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_PERMISSION',
  //   'UPDATE_PERMISSION',
  //   'DELETE_PERMISSION',
  //   'VIEW_PERMISSION',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyPermissionDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.permissionService.findAll(data, tokenPayload)
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_PERMISSION', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePermissionDto: UpdatePermissionDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.permissionService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updatePermissionDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_PERMISSION',
  //   'UPDATE_PERMISSION',
  //   'DELETE_PERMISSION',
  //   'VIEW_PERMISSION',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.permissionService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_PERMISSION', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.permissionService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
