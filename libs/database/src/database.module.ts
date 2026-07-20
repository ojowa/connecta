import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'connecta',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'connecta_db',
      schema: process.env.DB_SCHEMA || 'public',
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class DatabaseModule {}
