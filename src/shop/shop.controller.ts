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
import { ShopService } from './shop.service'
import { CreateShopDto, RegisterShopDto } from './dto/create-shop.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { SPECIAL_ROLE } from 'enums/common.enum'
import { TokenPayload } from 'interfaces/common.interface'
import { UpdateShopDto } from './dto/update-shop.dto'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { FindByCodeDto } from './dto/shop.dto'

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // @Post('register')
  // @HttpCode(HttpStatus.OK)
  // registerShop(@Body() createShopDto: RegisterShopDto, @Req() req: any) {
  //   return this.shopService.registerShop(createShopDto, req)
  // }

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // create(@Body() createShopDto: CreateShopDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.shopService.create(createShopDto, tokenPayload)
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // update(
  //   @Body() updateShopDto: UpdateShopDto,
  //   @Req() req: any,
  //   @Param('id') id: string
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.shopService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateShopDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.shopService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }

  // @Get('/public')
  // @HttpCode(HttpStatus.OK)
  // getShopByKeyword(@Query() data: FindByCodeDto) {
  //   return this.shopService.getShopByKeyword(data)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // findUniq(@Param('id') id: string) {
  //   return this.shopService.findUniq({
  //     id
  //   })
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // findAll(@Query() data: FindManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.shopService.findAll(data, tokenPayload)
  // }
}
