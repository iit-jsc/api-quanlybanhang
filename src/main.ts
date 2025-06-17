import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { json, static as static_ } from 'express'
import { BadRequestException, HttpStatus, ValidationPipe } from '@nestjs/common'
import { TransformInterceptor } from 'utils/ApiResponse'
import { PrismaClientExceptionFilter } from 'nestjs-prisma'
import { ValidationError } from 'class-validator'
import { errorFormatter } from 'utils/ApiErrors'
import { SecurityInterceptor } from '../security'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug']
    })
    const cfgService = app.get(ConfigService)
    const { httpAdapter } = app.get(HttpAdapterHost)

    // Security middleware
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:']
          }
        },
        crossOriginEmbedderPolicy: false
      })
    )

    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Forwarded-For',
        'X-Real-IP'
      ]
    })

    app.use('/uploads', static_('uploads'))
    app.use(json({ limit: '5mb' }))
    app.use(cookieParser())

    // Security interceptors và global guards
    app.useGlobalInterceptors(new TransformInterceptor(), new SecurityInterceptor())

    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        skipMissingProperties: false,
        disableErrorMessages: false,
        skipNullProperties: false,
        whitelist: true,
        forbidNonWhitelisted: true,
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
