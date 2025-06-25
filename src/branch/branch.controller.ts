import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { BranchService } from './branch.service'
import { RequestJWT } from 'interfaces/common.interface'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { CreateDataSampleDto, UpdateBranchDto } from './dto/create-branch.dto'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'
import { RolesGuard } from 'guards/roles.guard'

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get('current')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getCurrentBranch(@Req() req: RequestJWT) {
    const { branchId } = req
    return this.branchService.getCurrentBranch(branchId)
  }

  @Patch('current')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.branch.update)
  updateCurrentBranch(@Body() data: UpdateBranchDto, @Req() req: RequestJWT) {
    const { branchId, accountId } = req
    return this.branchService.updateCurrentBranch(data, branchId, accountId)
  }

  @Post('data-sample')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Roles(permissions.branch.update)
  createDataSample(@Req() req: RequestJWT, @Body() data: CreateDataSampleDto) {
    const { branchId } = req
    return this.branchService.setupBranchDataSample(data, branchId)
  }
}
