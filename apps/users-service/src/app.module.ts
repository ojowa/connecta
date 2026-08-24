import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Profile, UserPreference, Block, Report, Photo, PreKeyBundle, Message, Notification } from '@app/common/entities';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const entities = [User, Profile, UserPreference, Block, Report, Photo, PreKeyBundle, Message, Notification];

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
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
