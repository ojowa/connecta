import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NatsModule } from '@app/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEventsHandler } from './events/user-events.handler';
import { User, Profile, UserPreference, Block, Report, Photo, Notification, PreKeyBundle } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NatsModule,
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([User, Profile, UserPreference, Block, Report, Photo, Notification, PreKeyBundle]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserEventsHandler],
})
export class AppModule {}
