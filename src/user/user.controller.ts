import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Req,
  UploadedFile,
  Param,
  Patch,
  Delete,
  Query,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateEmployeeDTO } from './dto/create-employee-dto';
import { CustomFileInterceptor } from 'utils/ApiResponse';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDTO } from 'utils/Common.dto';
import { CreateBranchDTO } from 'src/branch/dto/create-branch.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CustomFileInterceptor('photoURL'))
  create(
    @Body() createEmployeeDto: CreateEmployeeDTO,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.userService.create(
      {
        ...createEmployeeDto,
        photoURL: file?.path,
      },
      tokenPayload,
    );
  }

  @Get('/employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findAll(findManyDto, tokenPayload);
  }

  @Get('/employee/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findUniq(
      {
        id: +id,
      },
      tokenPayload,
    );
  }

  @Patch('/employee/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() createEmployeeDto: CreateEmployeeDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.update(
      {
        where: {
          id: +id,
        },
        data: { ...createEmployeeDto },
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  removeMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.userService.removeMany(
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

    return this.userService.updatePhotoURL(
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
