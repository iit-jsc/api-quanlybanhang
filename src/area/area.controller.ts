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

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AREA_CREATE')
  create(@Body() createAreaDto: CreateAreaDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.areaService.create(createAreaDto, tokenPayload);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
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
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.areaService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  removeMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.areaService.removeMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
