import { Controller } from '@nestjs/common'

@Controller('supplier')
export class SupplierController {
  // constructor(private readonly supplierService: SupplierService) {}
  // @HttpCode(HttpStatus.OK)
  // @Post('')
  // @Roles('CREATE_SUPPLIER', SPECIAL_ROLE.MANAGER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // create(@Body() createSupplierDto: CreateSupplierDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierService.create(createSupplierDto, tokenPayload)
  // }
  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SUPPLIER',
  //   'UPDATE_SUPPLIER',
  //   'DELETE_SUPPLIER',
  //   'VIEW_SUPPLIER',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManySupplierDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierService.findAll(data, tokenPayload)
  // }
  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SUPPLIER',
  //   'UPDATE_SUPPLIER',
  //   'DELETE_SUPPLIER',
  //   'VIEW_SUPPLIER',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }
  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_SUPPLIER', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSupplierDto: UpdateSupplierDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateSupplierDto
  //     },
  //     tokenPayload
  //   )
  // }
  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_SUPPLIER', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
