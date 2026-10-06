import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

function buildOptions(): DataSourceOptions {
  const common = {
    type: 'postgres' as const,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: ['libs/common/src/entities/*.entity.ts'],
    migrations: ['migrations/*.ts'],
    migrationsTableName: 'migrations',
  };

  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      ...common,
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace(/^\//, ''),
      ssl: parsed.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false,
    };
  }

  return {
    ...common,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ojchat_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

export const dataSourceOptions: DataSourceOptions = buildOptions();
export const dataSource = new DataSource(dataSourceOptions);
