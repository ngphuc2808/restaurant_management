import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { RESPONSE_MESSAGE } from '@/constants/type';
import { I18nService } from 'nestjs-i18n';

export interface Response<T> {
  statusCode: number;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message:
          (this.i18n.t(
            this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()),
          ) as string) || '',
        data,
      })),
      catchError((err) => {
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: err.status || 500,
                errors: err.response.errors || null,
                message: err.message || 'Internal Server Error',
              },
              err.status || 500,
            ),
        );
      }),
    );
  }
}
