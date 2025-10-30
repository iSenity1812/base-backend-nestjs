import * as config from 'config';
import { DataSource, DataSourceOptions } from 'typeorm';

const dataSourceOptions: DataSourceOptions = {
  type: config.get('core.database.type') as any,
  host: config.get('core.database.host') as string,
  port: config.get('core.database.port') as number,
  username: config.get('core.database.username') as string,
  password: config.get('core.database.password') as string,
  database: config.get('core.database.dbName') as string,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['db/migrations/*{.ts,.js}'],
  synchronize: false,
};

export const connectionSource = new DataSource(dataSourceOptions);
