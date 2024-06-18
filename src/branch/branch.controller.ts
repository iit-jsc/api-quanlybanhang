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
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { CustomFileInterceptor } from 'utils/Helps';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Body() createBranchDto: CreateBranchDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.create(createBranchDto, tokenPayload);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: number,
    @Body() createBranchDto: CreateBranchDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.branchService.update(
      {
        where: {
          id,
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
}
