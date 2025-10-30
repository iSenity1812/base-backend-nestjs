import { GatewayService } from '@app/core/gateway';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ACCOUNT_OPERATION, SERVICE } from '../constants';
import { IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required');
    }

    const token = authHeader.substring(7);

    try {
      // Use gateway service to verify token instead of direct service call
      const payload = await this.gatewayService.runOperation({
        serviceId: SERVICE.ACCOUNT,
        operationId: ACCOUNT_OPERATION.VERIFY_ACCESS_TOKEN,
        payload: { token },
      });
      request.accessTokenJWT = token;
      request.userSession = payload;
      return true;
    } catch (error) {
      console.log('Invalid access token', error);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
