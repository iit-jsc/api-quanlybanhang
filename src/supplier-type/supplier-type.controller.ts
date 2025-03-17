import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query
} from '@nestjs/common'
import {
  CreateSupplierTypeDto,
  UpdateSupplierTypeDto
} from './dto/supplier-type.dto'
import { SupplierTypeService } from './supplier-type.service'
import { TokenPayload } from 'interfaces/common.interface'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { SPECIAL_ROLE } from 'enums/common.enum'
import { Roles } from 'guards/roles.decorator'
import { RolesGuard } from 'guards/roles.guard'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'

@Controller('supplier-type')
export class SupplierTypeController {
  constructor(private readonly supplierTypeService: SupplierTypeService) {}

  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_SUPPLIER_TYPE', SPECIAL_ROLE.MANAGER)
  // @Post('')
  // create(
  //   @Body() createSupplierTypeDto: CreateSupplierTypeDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierTypeService.create(createSupplierTypeDto, tokenPayload)
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SUPPLIER_TYPE',
  //   'UPDATE_SUPPLIER_TYPE',
  //   'DELETE_SUPPLIER_TYPE',
  //   'VIEW_SUPPLIER_TYPE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.supplierTypeService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SUPPLIER_TYPE',
  //   'UPDATE_SUPPLIER_TYPE',
  //   'DELETE_SUPPLIER_TYPE',
  //   'VIEW_SUPPLIER_TYPE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.supplierTypeService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_SUPPLIER_TYPE', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSupplierTypeDto: UpdateSupplierTypeDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.supplierTypeService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateSupplierTypeDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_SUPPLIER_TYPE', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.supplierTypeService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
