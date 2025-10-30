import { QueryFailedError, TypeORMError } from 'typeorm';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { ERROR_CODE } from '../constants/global.constants';
import type { ErrorResponse } from '../types';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);

  constructor() {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: InternalServerErrorException.name,
      message: 'Unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
      code: ERROR_CODE.UNEXPECTED_ERROR,
    };

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      errorResponse.statusCode = exception.getStatus();
      errorResponse.error = exception.name;
      errorResponse.message = exception.message;
      errorResponse.code = res.code ? res.code : ERROR_CODE.UNEXPECTED_ERROR;
    } else {
      switch (exception.constructor) {
        case QueryFailedError:
          errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          errorResponse.error = ForbiddenException.name;
          errorResponse.message =
            (exception as any).detail ||
            (exception as QueryFailedError).message;
          break;
        case TypeORMError:
          errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          errorResponse.error = ForbiddenException.name;
          errorResponse.message =
            (exception as any).detail ||
            (exception as QueryFailedError).message;
          break;
      }
    }

    if (errorResponse.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception, (exception as Error).stack);
      this.logger.error(JSON.stringify(exception));
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
