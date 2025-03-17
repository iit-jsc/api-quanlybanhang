import { Controller } from '@nestjs/common'
import { ManagerService } from './manager.service'

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  // @Post('/')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // create(@Body() createManagerDto: CreateManagerDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.managerService.create(createManagerDto, tokenPayload)
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // findAll(@Query() data: FindManyManagerDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.managerService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.managerService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateManagerDto: UpdateManagerDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.managerService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateManagerDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // deleteMany(@Req() req: any, @Body() deleteManyDto: DeleteManyDto) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.managerService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
