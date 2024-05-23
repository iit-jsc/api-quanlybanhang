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
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDTO } from 'utils/Common.dto';
import { CustomFileInterceptor } from 'utils/Helps';

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
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.create(
      {
        ...createBranchDto,
        photoURL: file?.path,
      },
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.findUniq(
      {
        id: +id,
      },
      tokenPayload,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() createBranchDto: CreateBranchDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.update(
      {
        where: {
          id: +id,
        },
        data: createBranchDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  removeMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.branchService.removeMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }

  @Patch(':id/update-photo')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CustomFileInterceptor('photoURL'))
  updatePhotoURL(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.updatePhotoURL(
      {
        where: {
          id: +id,
        },
        data: { photoURL: file?.path },
      },
      tokenPayload,
    );
  }
}
