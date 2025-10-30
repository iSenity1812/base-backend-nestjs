import { Issuer, type UserinfoResponse } from 'openid-client';

import { ACCOUNT_OPERATION } from '@app/common/constants';
import { UserRole } from '@app/common/enums';
import { GatewayService } from '@app/core/gateway';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { LoginMethod } from '../../account-authenticate/interfaces/login-method.interface';
import { BaseStrategy } from '../../account-authenticate/strategies/base.strategy';
import { UserEntity } from '../../account-user/entities/user.entity';
import { OpenIdProviderService } from '../services/openid-provider.service';

@Injectable()
export class OpenIdAuthStrategy extends BaseStrategy {
  method = LoginMethod.OPENID;

  constructor(
    private readonly gatewayService: GatewayService,
    private readonly providersService: OpenIdProviderService,
  ) {
    super();
  }

  async validate(data: {
    token: string;
    provider: string;
  }): Promise<UserEntity> {
    const { token, provider } = data;

    if (!token || !provider) {
      throw new UnauthorizedException('Token and provider are required');
    }

    const conf = await this.providersService.findByName(provider);
    if (!conf) throw new BadRequestException('Provider not found');

    const issuer = await Issuer.discover(conf.issuer_url);
    const client = new issuer.Client({
      client_id: conf.client_id,
      client_secret: conf.client_secret,
      redirect_uris: [conf.redirect_uri],
      response_types: ['code'],
    });

    // Validate the token
    const userInfo = await client.userinfo(token);
    if (!userInfo) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.gatewayService.runCommand({
      operationId: ACCOUNT_OPERATION.FIND_USER_BY_IDENTIFIER,
      payload: { identifier: userInfo.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    console.log('User info:', userInfo);
    console.log('Authenticated user:', user);
    console.log('data', data);

    return user;
  }

  async findOrCreateUser(userInfo: UserinfoResponse): Promise<UserEntity> {
    // Try to find existing user by email
    let user: UserEntity;
    try {
      user = await this.gatewayService.runCommand({
        operationId: ACCOUNT_OPERATION.FIND_USER_BY_IDENTIFIER,
        payload: { identifier: userInfo.email },
      });
    } catch {
      // User not found, create new one
      user = await this.gatewayService.runCommand({
        operationId: ACCOUNT_OPERATION.CREATE_USER,
        payload: {
          username: userInfo.preferred_username || userInfo.email,
          email: userInfo.email,
          fullName: userInfo.name,
          // Assign a default role, e.g., 'user'. Adjust as necessary.
          role: UserRole.BASIC,
        },
      });
    }
    return user;
  }
}
