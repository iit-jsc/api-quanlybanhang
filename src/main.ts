import * as cookieParser from 'cookie-parser'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { json, static as static_ } from 'express'
import { ValidationPipe } from '@nestjs/common'
import { TransformInterceptor } from 'utils/ApiResponse'
import { PrismaClientExceptionFilter } from 'nestjs-prisma'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const cfgService = app.get(ConfigService)
    const { httpAdapter } = app.get(HttpAdapterHost)

    app.enableCors({ origin: true, credentials: true })
    app.use('/uploads', static_('uploads'))
    app.use(json({ limit: '2mb' }))
    app.use(cookieParser())
    app.useGlobalInterceptors(new TransformInterceptor())
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
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
