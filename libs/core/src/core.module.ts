import { getConfig } from '@app/common';
import type { GatewayConfig } from '@app/common/types';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { AxiosModule } from './axios/axios.module';
import { HealthModule } from './health/health.module';

const gatewayConfig = getConfig<GatewayConfig>('core.gateway');

@Module({
  imports: [
    DatabaseModule,
    GatewayModule.forRoot({
      services: Object.entries(gatewayConfig.services).map(
        ([serviceId, transport]) => ({
          serviceId,
          transport,
        }),
      ),
    }),
    CacheModule.register(),
    AxiosModule.forRoot(),
    HealthModule,
  ],
  exports: [DatabaseModule, GatewayModule, CacheModule, HealthModule],
})
export class CoreModule {
  static forRoot() {
    return {
      global: true,
      module: CoreModule,
    };
  }
}
