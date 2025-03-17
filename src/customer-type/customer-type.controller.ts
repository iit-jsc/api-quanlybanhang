import { Controller } from '@nestjs/common'

import { CustomerTypeService } from './customer-type.service'

@Controller('customer-type')
export class CustomerTypeController {
  constructor(private readonly customerTypeService: CustomerTypeService) {}

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_CUSTOMER_TYPE', SPECIAL_ROLE.MANAGER)
  // create(
  //   @Body() createCustomerTypeDto: CreateCustomerTypeDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.customerTypeService.create(createCustomerTypeDto, tokenPayload)
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_CUSTOMER_TYPE',
  //   'UPDATE_CUSTOMER_TYPE',
  //   'DELETE_CUSTOMER_TYPE',
  //   'VIEW_CUSTOMER_TYPE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.customerTypeService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_CUSTOMER_TYPE',
  //   'UPDATE_CUSTOMER_TYPE',
  //   'DELETE_CUSTOMER_TYPE',
  //   'VIEW_CUSTOMER_TYPE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.customerTypeService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_CUSTOMER_TYPE', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCustomerTypeDto: UpdateCustomerTypeDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.customerTypeService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateCustomerTypeDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_CUSTOMER_TYPE', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.customerTypeService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
