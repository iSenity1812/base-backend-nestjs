import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from 'class-transformer/types';
import { OpenIdProviderEntity } from './entities/openid-provider.entity';
import { GatewayModule } from '@app/core/gateway';
import { OpenIdProviderController } from './controllers/openid-provider.controller';
import { OpenIdAuthenticateController } from './controllers/openid-authenticate.controller';
import { OpenIdProviderService } from './services/openid-provider.service';
import { OpenIdAuthStrategy } from './strategies/openid.strategy';
import { OpenIdAuthenticateService } from './services/openid-authenticate.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OpenIdProviderEntity]), GatewayModule],
  controllers: [OpenIdProviderController, OpenIdAuthenticateController],
  providers: [
    OpenIdProviderService,
    OpenIdAuthStrategy,
    OpenIdAuthenticateService,
  ],
  exports: [TypeOrmModule, OpenIdProviderService, OpenIdAuthStrategy],
})
export class AccountOidcModule {}
