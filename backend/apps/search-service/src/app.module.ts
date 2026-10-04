import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { allEntities } from '@app/common/entities';
import { TypeOrmConfigService } from '@app/database/typeorm-config.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(allEntities),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class AppModule {}
