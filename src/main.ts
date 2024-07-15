import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { json, static as static_ } from 'express';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaExceptionFilter, errorFormatter } from 'utils/ApiErrors';
import { ValidationError } from 'class-validator';
import { TransformInterceptor } from 'utils/ApiResponse';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const cfgService = app.get(ConfigService);

    app.use('/uploads', static_('uploads'));
    app.use(json({ limit: '200mb' }));
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.setGlobalPrefix('api');
    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        skipMissingProperties: false,
        disableErrorMessages: false,
        skipNullProperties: false,
        exceptionFactory: (errors: ValidationError[]) => {
          const formattedErrors = errorFormatter(errors);
          return new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation failed!',
            errors: formattedErrors,
          });
        },
      }),
    );

    await app.listen(cfgService.get<number>('PORT'));
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
