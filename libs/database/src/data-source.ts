import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ojchat_db',
  synchronize: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['libs/common/src/entities/*.entity.ts'],
  migrations: ['database/migrations/*.ts'],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(dataSourceOptions);
