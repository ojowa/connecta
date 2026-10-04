import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const url = process.env.DATABASE_URL;

    if (url) {
      const parsed = new URL(url);
      return {
        type: 'postgres',
        host: parsed.hostname,
        port: parseInt(parsed.port, 10) || 5432,
        username: parsed.username,
        password: parsed.password,
        database: parsed.pathname.replace(/^\//, ''),
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        ssl:
          parsed.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        logging: process.env.NODE_ENV === 'development',
        extra: {
          max: 20,
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
        },
      };
    }

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ojchat_db',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      logging: process.env.NODE_ENV === 'development',
      extra: {
        max: 20,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    };
  }
}
