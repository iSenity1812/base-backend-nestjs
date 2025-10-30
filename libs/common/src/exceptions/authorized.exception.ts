import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class UnauthorizedException extends HttpException {
  constructor(
    message: string,
    code: string = 'UNAUTHORIZED',
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      code: code,
    };
    super(response, HttpStatus.UNAUTHORIZED, options);
  }
}
