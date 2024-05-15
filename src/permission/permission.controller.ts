import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDTO } from './dto/create-permission.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { BranchGuard } from 'guards/branch.guard';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  create(@Body() createPermissionDto: CreatePermissionDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.permissionService.create(createPermissionDto, tokenPayload);
  }
}
