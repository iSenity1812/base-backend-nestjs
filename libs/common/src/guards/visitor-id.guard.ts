import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_VISITOR_ID_EXEMPT_KEY } from '../decorators/visitor-id-exempt.decorator';

@Injectable()
export class VisitorIdGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is exempt from visitor ID requirement (e.g., health checks)
    const isExempt = this.reflector.getAllAndOverride<boolean>(
      IS_VISITOR_ID_EXEMPT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isExempt) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const visitorId = request.headers['x-visitor-id'];

    // We always require visitor ID for proper session tracking
    if (!visitorId) {
      throw new BadRequestException('x-visitor-id header is required');
    }

    // Validate visitor ID length (at least 8 characters)
    if (typeof visitorId !== 'string' || visitorId.length < 8) {
      throw new BadRequestException(
        'x-visitor-id must be at least 8 characters long',
      );
    }

    // Store visitor ID in request for later use
    request.visitorId = visitorId;

    return true;
  }
}
