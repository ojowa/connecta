import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { allEntities } from '@app/common/entities';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'ojchat_user',
      password: process.env.DB_PASSWORD || 'ojchat_password',
      database: process.env.DB_NAME || 'ojchat_db',
      entities: allEntities,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(allEntities),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
