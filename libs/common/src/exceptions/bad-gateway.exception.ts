import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(message: string, code: string, options?: HttpExceptionOptions) {
    const response = {
      message,
      code: code,
    };
    super(response, HttpStatus.BAD_REQUEST, options);
  }
}
