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
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:', 'http:'],
            connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:']
          }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
      })
    )

    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Forwarded-For',
        'X-Real-IP',
        'Accept',
        'Origin',
        'User-Agent',
        'Cache-Control'
      ],
      exposedHeaders: ['Set-Cookie'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    })

    // Additional CORS middleware for complex requests
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, X-Forwarded-For, X-Real-IP, Accept, Origin, User-Agent, Cache-Control'
      )

      if (req.method === 'OPTIONS') {
        res.status(204).send()
        return
      }
      next()
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

    const port = cfgService.get<number>('PORT') || 3000
    await app.listen(port)
  } catch (error) {
    console.error('❌ Failed to start server:', error)
  }
}

bootstrap()
