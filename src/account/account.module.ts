import { getConfig } from '@app/common';
import { Module } from '@nestjs/common';

import { PasswordAuthStrategy } from './packages/account-authenticate';
import { AccountAuthenticateModule } from './packages/account-authenticate/account-authenticate.module';
import { AccountOidcModule } from './packages/account-openid/account-oidc.module';
import { OpenIdAuthStrategy } from './packages/account-openid/strategies/openid.strategy';
import { AccountUserModule } from './packages/account-user/account-user.module';

@Module({
  imports: [
    AccountUserModule,
    AccountOidcModule,
    AccountAuthenticateModule.forRoot({
      jwtSecret: getConfig('account.token.secret'),
      jwtExpiresIn: getConfig('account.token.expiresIn'),
      strategies: [PasswordAuthStrategy, OpenIdAuthStrategy],
    }),
  ],
  exports: [AccountUserModule, AccountAuthenticateModule, AccountOidcModule],
})
export class AccountModule {}
