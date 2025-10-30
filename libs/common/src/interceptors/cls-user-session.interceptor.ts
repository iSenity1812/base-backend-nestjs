import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import type { TokenPayload } from '../interfaces';
import { ClsContextService } from '../services/cls-context.service';

@Injectable()
export class ClsUserSessionInterceptor implements NestInterceptor {
  constructor(private readonly clsContextService: ClsContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // If userSession exists on the request (set by JWT guard), store it in CLS context
    if (request.userSession) {
      this.clsContextService.setUserSession(
        request.userSession as TokenPayload,
      );
    }

    // If visitorId exists on the request (set by visitor ID guard), store it in CLS context
    if (request.visitorId) {
      this.clsContextService.setVisitorId(request.visitorId);
    }

    return next.handle();
  }
}
