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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_PERMISSION', SPECIAL_ROLE.MANAGER)
  create(@Body() createPermissionDto: CreatePermissionDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.permissionService.create(createPermissionDto, tokenPayload);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_PERMISSION',
    'UPDATE_PERMISSION',
    'DELETE_PERMISSION',
    'VIEW_PERMISSION',
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.permissionService.findAll(findManyDto, tokenPayload);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_PERMISSION', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: number,
    @Body() createPermissionDto: CreatePermissionDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.permissionService.update(
      {
        where: {
          id,
        },
        data: createPermissionDto,
      },
      tokenPayload,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_PERMISSION',
    'UPDATE_PERMISSION',
    'DELETE_PERMISSION',
    'VIEW_PERMISSION',
    SPECIAL_ROLE.MANAGER,
  )
  findUniq(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.permissionService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_PERMISSION', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.permissionService.deleteMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
