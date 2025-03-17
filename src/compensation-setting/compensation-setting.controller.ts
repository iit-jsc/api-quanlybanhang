import { Controller } from '@nestjs/common'
import { CompensationSettingService } from './compensation-setting.service'

@Controller('compensation-setting')
export class CompensationSettingController {
  constructor(
    private readonly compensationSettingService: CompensationSettingService
  ) {}

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_SALARY', SPECIAL_ROLE.MANAGER)
  // create(
  //   @Body() createCompensationSettingDto: CreateCompensationSettingDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.compensationSettingService.create(
  //     createCompensationSettingDto,
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SALARY',
  //   'UPDATE_SALARY',
  //   'DELETE_SALARY',
  //   'VIEW_SALARY',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyCompensationSettingDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.compensationSettingService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SALARY',
  //   'UPDATE_SALARY',
  //   'DELETE_SALARY',
  //   'VIEW_SALARY',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.compensationSettingService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_SALARY', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.compensationSettingService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
