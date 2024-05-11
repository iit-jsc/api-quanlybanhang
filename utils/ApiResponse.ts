import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function createApiResponse<T>(
  data: T,
  statusCode: number = HttpStatus.OK,
  message: string = 'Thành công!',
) {
  return {
    message,
    statusCode,
    data,
  };
}

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: any) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: data?.message ?? 'Thành công!',
        data: data as T,
      })),
    );
  }
}
