import type { TokenRole } from '@app/common/enums';

export interface TokenPayload {
  sub: string; // Subject (usually user ID)
  tokenRole: TokenRole;
  method: string;
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration time (timestamp)
}
