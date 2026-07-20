import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AppConfigService } from '@app/config/config.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: AppConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const { host, port, username, password, database, synchronize, ssl } =
      this.configService.database;

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      synchronize,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      logging: this.configService.get('NODE_ENV') === 'development',
      logger: 'advanced-console',
      extra: {
        max: 20,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      },
    };
  }
}
