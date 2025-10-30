import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class GatewayException extends HttpException {
  constructor(
    message: string,
    code: string = 'BAD_GATEWAY',
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      code: code,
    };
    super(response, HttpStatus.BAD_GATEWAY, options);
  }
}
