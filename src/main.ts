import * as cookieParser from 'cookie-parser'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { json, static as static_ } from 'express'
import { BadRequestException, HttpStatus, ValidationPipe } from '@nestjs/common'
import { TransformInterceptor } from 'utils/ApiResponse'
import { PrismaClientExceptionFilter } from 'nestjs-prisma'
import { ValidationError } from 'class-validator'
import { errorFormatter } from 'utils/ApiErrors'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const cfgService = app.get(ConfigService)
    const { httpAdapter } = app.get(HttpAdapterHost)

    app.enableCors({
      origin: '*',
      credentials: true
    })
    app.use('/uploads', static_('uploads'))
    app.use(json({ limit: '5mb' }))
    app.use(cookieParser())
    app.useGlobalInterceptors(new TransformInterceptor())
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        skipMissingProperties: false,
        disableErrorMessages: false,
        skipNullProperties: false,
        exceptionFactory: (errors: ValidationError[]) => {
          return new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation failed!',
            errors: errorFormatter(errors)
          })
        }
      })
    )

    await app.listen(cfgService.get<number>('PORT'))
  } catch (error) {
    console.log(error)
  }
}

bootstrap()
