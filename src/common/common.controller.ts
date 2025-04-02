import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { CustomFilesInterceptor } from 'utils/Helps'
import { CommonService } from './common.service'

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('/upload-photos')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(CustomFilesInterceptor('photoURLs', 10))
  create(@UploadedFiles() files: Array<Express.Multer.File>) {
    const photoURLs = files.map(file => {
      return file.path.replace(/\\/g, '/')
    })

    return this.commonService.uploadPhotoURLs({ photoURLs })
  }
}
