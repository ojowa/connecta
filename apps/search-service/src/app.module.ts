import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NatsModule } from '@app/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { User, Profile, Photo } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NatsModule,
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Profile, Photo]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class AppModule {}
