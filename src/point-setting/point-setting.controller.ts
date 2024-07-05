import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PointSettingService } from './point-setting.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';
import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { UpdatePointSettingDto } from './dto/point-setting.dto';

@Controller('point-setting')
export class PointSettingController {
  constructor(private readonly pointSettingService: PointSettingService) {}

  @Patch('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(
    @Body() updatePointSettingDto: UpdatePointSettingDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.pointSettingService.update(
      {
        data: updatePointSettingDto,
      },
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.pointSettingService.findUniq(tokenPayload);
  }
}
