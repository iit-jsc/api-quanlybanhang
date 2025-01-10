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
  UseGuards,
} from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto } from 'utils/Common.dto';
import {
  CreateInventoryTransactionDto,
  FindManInventTransDto,
  UpdateInventoryTransactionDto,
} from './dto/inventory-transaction.dto';

@Controller('inventory-transaction')
export class InventoryTransactionController {
  constructor(
    private readonly inventoryTransactionService: InventoryTransactionService,
  ) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_WAREHOUSE', SPECIAL_ROLE.MANAGER)
  create(
    @Body() createInventoryTransactionDto: CreateInventoryTransactionDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.inventoryTransactionService.create(
      createInventoryTransactionDto,
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_WAREHOUSE',
    'UPDATE_WAREHOUSE',
    'DELETE_WAREHOUSE',
    'VIEW_WAREHOUSE',
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() data: FindManInventTransDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.inventoryTransactionService.findAll(data, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_WAREHOUSE',
    'UPDATE_WAREHOUSE',
    'DELETE_WAREHOUSE',
    'VIEW_WAREHOUSE',
    SPECIAL_ROLE.MANAGER,
  )
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.inventoryTransactionService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_WAREHOUSE', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateInventoryTransactionDto: UpdateInventoryTransactionDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.inventoryTransactionService.update(
      {
        where: {
          id,
        },
        data: updateInventoryTransactionDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_WAREHOUSE', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.inventoryTransactionService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
