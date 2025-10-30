import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ApiResponse } from '../utils/dto';

@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (!data?.data && !data?.message && !data?.meta && !data?.populated) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            data: data,
            message: 'Success',
            meta: undefined,
            populated: undefined,
          };
        }
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data?.message || 'Success',
          data: data?.data ?? null,
          meta: data?.meta || undefined,
          populated: data?.populated || undefined,
        };
      }),
    );
  }
}
