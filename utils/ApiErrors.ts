import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from '@nestjs/common';

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: ErrorItem[];
}
interface ErrorItem {
  property: string;
  message: string;
}
export class CustomHttpException extends HttpException {
  constructor(statusCode: number, message: string, errors: ErrorItem[] = []) {
    const response: ErrorResponse = {
      statusCode,
      message,
    };

    if (errors.length > 0) {
      response.errors = errors.map((error) => ({
        property: error.property,
        message: error.message,
      }));
    }

    super(response, HttpStatus.BAD_REQUEST);
  }
}

export function errorFormatter(
  errors: ValidationError[],
  errMessage?: any,
  parentField?: string,
): any {
  const message = errMessage || {};
  let errorField = '';
  let validationsList = [];

  errors.forEach((error) => {
    errorField = parentField
      ? `${parentField}.${error.property}`
      : error.property;

    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, message, errorField);
    } else {
      validationsList = Object.values(error.constraints || {});
      message[errorField] =
        validationsList.length > 0 ? validationsList.pop() : 'Invalid Value!';
    }
  });

  return message;
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log(exception);

    if (exception.code === 'P2002') {
      const failedField = exception.meta.target;

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Validation failed',
        errors: { [failedField]: `Dữ liệu đã được sử dụng!` },
      });
    }

    if (exception.code === 'P2011') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: {
          [exception.meta.constraint[0]]: `Dữ liệu không tồn tại (1)!`,
        },
      });
    }

    if (exception.code === 'P2003') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Dữ liệu không tồn tại (2)!',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const { message, errors } = exception.getResponse() as any;

      return response.status(status).json({
        statusCode: status,
        message: message || 'UNKNOWN ERROR',
        errors: errors || {},
      });
    }

    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'UNKNOWN ERROR',
    });
  }
}
