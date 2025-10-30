import { ClsService } from 'nestjs-cls';
import type { TokenPayload } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';

export interface ClsUserContext {
  userSession?: TokenPayload;
  visitorId?: string;
  [key: string | symbol]: any;
}

@Injectable()
export class ClsContextService {
  constructor(private readonly clsService: ClsService<ClsUserContext>) {}

  setUserSession(userSession: TokenPayload): void {
    this.clsService.set('userSession', userSession);
  }

  getUserSession(): TokenPayload | undefined {
    return this.clsService.get('userSession');
  }

  setVisitorId(visitorId: string): void {
    this.clsService.set('visitorId', visitorId);
  }

  getVisitorId(): string | undefined {
    return this.clsService.get('visitorId');
  }

  getActorId(): string | undefined {
    const userSession = this.getUserSession();
    return userSession?.sub; // sub = subject = user ID
  }

  hasUserSession(): boolean {
    return !!this.getUserSession();
  }
}
