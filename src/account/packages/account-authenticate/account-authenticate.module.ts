import { Module, DynamicModule, type Provider } from '@nestjs/common';
import { PasswordAuthStrategy, type BaseStrategy } from './strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from '@app/core/gateway';
import { OperationsMap } from './commands/impl';
import { AccountAuthenticateController } from './controllers/account-authenticate.controller';
import { AccountAuthenticateService } from './services/account-authenticate.service';
import { AccountTokenService } from './services/account-token.service';
import { UserRoleToTokenRoleMapper } from './mapper/token-role.mapper';
import { CommandHandlers } from './commands';

export interface AuthenticateModuleOptions {
  jwtSecret: string;
  jwtExpiresIn?: '1h' | '10m';
  strategies: Provider<BaseStrategy>[];
}

@Module({})
export class AccountAuthenticateModule {
  static forRoot(options: AuthenticateModuleOptions): DynamicModule {
    const strategies = options.strategies || [PasswordAuthStrategy];
    return {
      module: AccountAuthenticateModule,
      imports: [
        TypeOrmModule.forFeature([RefreshTokenEntity]),
        JwtModule.register({
          secret: options.jwtSecret,
          signOptions: { expiresIn: options.jwtExpiresIn || '1h' },
        }),
        GatewayModule.forFeature(OperationsMap),
      ],
      controllers: [AccountAuthenticateController],
      providers: [
        AccountAuthenticateService,
        AccountTokenService,
        UserRoleToTokenRoleMapper,
        PasswordAuthStrategy,
        ...CommandHandlers,
        {
          provide: 'AUTH_STRATEGIES',
          useFactory: (...strategies: BaseStrategy[]) => strategies,
          inject: [...(strategies as any)],
        },
      ],
      exports: [
        AccountAuthenticateService,
        AccountTokenService,
        UserRoleToTokenRoleMapper,
        TypeOrmModule,
        'AUTH_STRATEGIES',
      ],
    };
  }

  static forFeature(strategies: any[]): DynamicModule {
    return {
      module: AccountAuthenticateModule,
      providers: [...strategies],
      exports: [...strategies],
    };
  }
}
