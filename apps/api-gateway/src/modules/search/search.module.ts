import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { User, Profile, Photo } from '@app/common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Photo])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
