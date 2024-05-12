import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Body() CreateBranchDTO: CreateBranchDTO) {
    return this.branchService.create(CreateBranchDTO);
  }
}
