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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AreaService } from './area.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CustomFileInterceptor } from 'utils/Helps';
import { CreateAreaDto } from './dto/create-area.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { ACCOUNT_TYPE } from 'enums/user.enum';
import { SPECIAL_ROLE } from 'enums/common.enum';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_AREA', SPECIAL_ROLE.MANAGER)
  create(@Body() createAreaDto: CreateAreaDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.areaService.create(createAreaDto, tokenPayload);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_AREA', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: number,
    @Body() createAreaDto: CreateAreaDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.areaService.update(
      {
        where: {
          id,
        },
        data: createAreaDto,
      },
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_AREA',
    'UPDATE_AREA',
    'DELETE_AREA',
    'VIEW_AREA',
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.areaService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_AREA',
    'UPDATE_AREA',
    'DELETE_AREA',
    'VIEW_AREA',
    SPECIAL_ROLE.MANAGER,
  )
  findUniq(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.areaService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_AREA', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.areaService.deleteMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
