import { getConfig } from '@app/common/utils/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    NestCacheModule.register({
      store: 'memory', // memory store is used by default
      max: getConfig('core.cache.max'), // maximum number of items that can be stored in the cache
      ttl: getConfig('core.cache.ttl'), // time to live in seconds
      isGlobal: true,
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
