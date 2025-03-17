import * as cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { json, static as static_ } from 'express'
import { ValidationPipe } from '@nestjs/common'
import { PrismaExceptionFilter } from 'utils/ApiErrors'
import { TransformInterceptor } from 'utils/ApiResponse'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const cfgService = app.get(ConfigService)

    app.enableCors({ origin: true, credentials: true })
    app.use('/uploads', static_('uploads'))
    app.use(json({ limit: '2mb' }))
    app.use(cookieParser())
    app.useGlobalFilters(new PrismaExceptionFilter())
    app.useGlobalInterceptors(new TransformInterceptor())
    app.setGlobalPrefix('api')

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        skipMissingProperties: false,
        disableErrorMessages: false,
        skipNullProperties: false
      })
    )

    await app.listen(cfgService.get<number>('PORT'))
  } catch (error) {
    console.log(error)
  }
}

bootstrap()
