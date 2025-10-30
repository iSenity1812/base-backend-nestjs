import { ACCOUNT_OPERATION } from '@app/common/constants';
import { PasswordHash } from '@app/common/utils/string';
import { GatewayService } from '@app/core/gateway';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserEntity } from '../../account-user/entities/user.entity';
import { LoginMethod } from '../interfaces/login-method.interface';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class PasswordAuthStrategy extends BaseStrategy {
  method = LoginMethod.PASSWORD;

  constructor(private readonly gatewayService: GatewayService) {
    super();
  }

  async validate(data: {
    username: string;
    password: string;
  }): Promise<UserEntity> {
    const { username, password } = data;

    if (!username || !password) {
      throw new UnauthorizedException('Username and password are required');
    }

    const user = await this.gatewayService.runCommand({
      operationId: ACCOUNT_OPERATION.FIND_USER_BY_IDENTIFIER,
      payload: { identifier: username },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Simple password comparison for demo purposes
    // In production, use proper password hashing like bcrypt, scrypt, or argon2
    const isPasswordValid = this.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): boolean {
    return PasswordHash.comparePassword(plainPassword, hashedPassword);
  }
}
