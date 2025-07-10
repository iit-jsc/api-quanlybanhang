import * as cookieParser from 'cookie-parser'
// import helmet from 'helmet' // Disabled for CORS
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { json, static as static_ } from 'express'
import { BadRequestException, HttpStatus, ValidationPipe } from '@nestjs/common'
import { TransformInterceptor } from 'utils/ApiResponse'
import { PrismaClientExceptionFilter } from 'nestjs-prisma'
import { PrismaExceptionFilter } from './common/exceptions/prisma-exception.filter'
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter'
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

    // app.use(helmet(...))    // CORS - Allow everything    app.enableCors()
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', '*')
      res.header('Access-Control-Allow-Headers', '*')
      res.header('Access-Control-Allow-Credentials', 'true')
      req.method === 'OPTIONS' ? res.status(200).end() : next()
    })

    app.use('/uploads', static_('uploads'))
    app.use(json({ limit: '5mb' }))
    app.use(cookieParser())

    // Security interceptors và global guards
    app.useGlobalInterceptors(new TransformInterceptor(), new SecurityInterceptor())

    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new PrismaClientExceptionFilter(httpAdapter),
      new PrismaExceptionFilter()
    )
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        skipMissingProperties: false,
        disableErrorMessages: false,
        skipNullProperties: false,
        exceptionFactory: (errors: ValidationError[]) => {
          return new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Dữ liệu không hợp lệ',
            errors: errorFormatter(errors)
          })
        }
      })
    )

    const port = cfgService.get<number>('PORT') || 3000
    await app.listen(port)

    console.log('\n🚀 ========================================')
    console.log(`🌟 Server is running on http://localhost:${port}`)
    console.log(`🌍 CORS: COMPLETELY DISABLED - ALL ORIGINS ALLOWED`)
    console.log(`🔓 Security: HELMET DISABLED FOR DEVELOPMENT`)
    console.log(`📡 API Base URL: http://localhost:${port}`)
    console.log('🚀 ========================================\n')
  } catch (error) {
    console.error('❌ Failed to start server:', error)
  }
}

bootstrap()
