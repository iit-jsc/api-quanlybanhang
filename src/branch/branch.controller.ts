import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CustomFileInterceptor } from 'utils/ApiResponse';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CustomFileInterceptor('photoURL'))
  create(
    @Body() createBranchDto: CreateBranchDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);

    return this.branchService.create(createBranchDto);
  }
}
