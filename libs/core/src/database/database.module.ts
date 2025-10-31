import { getConfig } from '@app/common/utils/config';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: getConfig('core.database.type'),
      host: getConfig('core.database.host'),
      port: getConfig('core.database.port'),
      username: getConfig('core.database.username'),
      password: getConfig<string>('core.database.password'),
      database: getConfig('core.database.database'),
      synchronize: getConfig('core.database.synchronize'),
      autoLoadEntities: true,
      extra: {
        connectionLimit: getConfig('core.database.extra.connectionLimit', 100),
        idleTimeoutMillis: getConfig(
          'core.database.extra.idleTimeoutMillis',
          20000,
        ),
        connectionTimeoutMillis: getConfig(
          'core.database.extra.connectionTimeoutMillis',
          2000,
        ),
      },
      pool: {
        max: getConfig('core.database.pool.max', 15),
        min: getConfig('core.database.pool.min', 2),
        idleTimeoutMillis: getConfig(
          'core.database.pool.idleTimeoutMillis',
          20000,
        ),
      },
      logging: getConfig('core.database.logging', false),
    } as TypeOrmModuleOptions),
  ],
  exports: [],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);
  constructor() {
    this.printDatabaseDebugInfo();
  }
  private printDatabaseDebugInfo() {
    const dbConfig = {
      type: getConfig('core.database.type'),
      host: getConfig('core.database.host'),
      port: getConfig('core.database.port'),
      username: getConfig('core.database.username'),
      password: '***MASKED***', // Don't log the actual password
      database: getConfig('core.database.database'),
      synchronize: getConfig('core.database.synchronize'),
      logging: getConfig('core.database.logging', false),
      extra: {
        connectionLimit: getConfig('core.database.extra.connectionLimit', 100),
        idleTimeoutMillis: getConfig(
          'core.database.extra.idleTimeoutMillis',
          20000,
        ),
        connectionTimeoutMillis: getConfig(
          'core.database.extra.connectionTimeoutMillis',
          2000,
        ),
      },
      pool: {
        max: getConfig('core.database.pool.max', 15),
        min: getConfig('core.database.pool.min', 2),
        idleTimeoutMillis: getConfig(
          'core.database.pool.idleTimeoutMillis',
          20000,
        ),
      },
    };
    this.logger.debug('📊 Database Configuration:');
    this.logger.debug(
      `  Connection: ${dbConfig.type}://${dbConfig.username}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    );
    this.logger.debug(`  Synchronize: ${dbConfig.synchronize}`);
    this.logger.debug(`  Logging: ${dbConfig.logging}`);
    this.logger.debug(
      `  Pool Settings: min=${dbConfig.pool.min}, max=${dbConfig.pool.max}`,
    );
    this.logger.debug(`  Connection Limits: ${dbConfig.extra.connectionLimit}`);
    this.logger.debug(
      `  Timeouts: connection=${dbConfig.extra.connectionTimeoutMillis}ms, idle=${dbConfig.extra.idleTimeoutMillis}ms`,
    );
  }
  static forRoot() {
    return {
      global: true,
      module: DatabaseModule,
    };
  }
}
