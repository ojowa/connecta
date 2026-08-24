import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media, User, Profile } from '@app/common/entities';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

const entities = [Media, User, Profile];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'connecta_user',
      password: process.env.DB_PASSWORD || 'connecta_password',
      database: process.env.DB_NAME || 'connecta_db',
      entities,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class AppModule {}
