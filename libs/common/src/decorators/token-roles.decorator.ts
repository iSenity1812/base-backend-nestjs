import { SetMetadata } from '@nestjs/common';
import type { TokenRole } from '../enums';

export const TOKEN_ROLES_KEY = 'token_roles';
export const TokenRoles = (...roles: TokenRole[]) =>
  SetMetadata(TOKEN_ROLES_KEY, roles);
