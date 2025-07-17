import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { HttpException, HttpStatus } from '@nestjs/common'

const maxSize = 10 * 1024 * 1024

const imageFileFilter = (req, file, callback) => {
  // Kiểm tra mimetype thay vì chỉ dựa vào extension
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new HttpException('Chỉ cho phép tải lên file ảnh!', HttpStatus.BAD_REQUEST),
      false
    )
  }

  callback(null, true)
}

export function CustomFilesInterceptor(
  fieldName: string,
  maxFiles: number,
  destinationPath: string = './uploads',
  fileSize: number = maxSize
) {
  return FilesInterceptor(fieldName, maxFiles, {
    storage: diskStorage({
      destination: destinationPath,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('')
        cb(null, `${randomName}${extname(file.originalname)}`)
      }
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize }
  })
}
