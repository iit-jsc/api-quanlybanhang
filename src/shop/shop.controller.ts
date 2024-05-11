import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { CreateBranchDto } from 'src/branch/dto/create-branch.dto';
import { CreateUserDto } from 'src/user/dto/create-user-dto';
import { ACCOUNT_STATUS, USER_TYPE } from 'enums/user.enum';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @HttpCode(200)
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }
}
