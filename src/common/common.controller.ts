import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { CustomFileInterceptor, CustomFilesInterceptor } from 'utils/Helps';
import { CommonService } from './common.service';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('/update-photos')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(CustomFilesInterceptor('photoURLs', 10))
  create(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: any) {
    const photoURLs = files.map((file) => file.path);

    return this.commonService.uploadPhotoURLs({ photoURLs });
  }
}
