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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateEmployeeDTO } from './dto/create-employee-dto';
import { CustomFileInterceptor } from 'utils/ApiResponse';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';

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
}
