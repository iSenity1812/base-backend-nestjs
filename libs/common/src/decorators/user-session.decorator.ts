import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const UserSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userSession;
  },
);
