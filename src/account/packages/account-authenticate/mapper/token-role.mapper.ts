import { TokenRole, UserRole } from '@app/common/enums';
import { Mapper } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRoleToTokenRoleMapper extends Mapper<UserRole, TokenRole> {
  map(source: UserRole): TokenRole {
    switch (source) {
      case UserRole.SUPER_ADMIN:
        return TokenRole.SUPER_ADMIN;
      case UserRole.ADMIN:
        return TokenRole.ADMIN;
      case UserRole.BASIC:
        return TokenRole.BASIC;
      case UserRole.ANONYMOUS:
        return TokenRole.GUEST;
      case UserRole.SYSTEM:
        return TokenRole.SUPER_ADMIN;
      default:
        return TokenRole.GUEST;
    }
  }
}
