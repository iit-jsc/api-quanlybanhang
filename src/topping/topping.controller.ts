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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ToppingService } from './topping.service';
import { TokenPayload } from 'interfaces/common.interface';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { BranchGuard } from 'guards/branch.guard';
import { CustomFilesInterceptor } from 'utils/Helps';
import { CreateToppingDto } from './dto/create-topping.dto';
import { DeleteManyWithIdentifierDto, FindManyDto } from 'utils/Common.dto';

@Controller('topping')
export class ToppingController {
  constructor(private readonly toppingService: ToppingService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  @UseInterceptors(CustomFilesInterceptor('photoURLs', 10))
  create(
    @Body() createToppingDto: CreateToppingDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    const photoURLs = files.map((file) => file.path);

    return this.toppingService.create(
      { ...createToppingDto, photoURLs },
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.toppingService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.toppingService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(':identifier')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  @UseInterceptors(CustomFilesInterceptor('photoURLs', 10))
  update(
    @Param('identifier') identifier: string,
    @Body() createToppingDto: CreateToppingDto,
    @Req() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    const photoURLs = files.map((file) => file.path);

    return this.toppingService.update(
      {
        where: {
          identifier: identifier,
        },
        data: { ...createToppingDto, photoURLs },
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  deleteMany(
    @Body() deleteManyDto: DeleteManyWithIdentifierDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.toppingService.removeMany(
      {
        identifier: {
          in: deleteManyDto.identifiers,
        },
        branch: {
          id: {
            in: deleteManyDto.branchIds,
          },
        },
      },
      tokenPayload,
    );
  }
}
