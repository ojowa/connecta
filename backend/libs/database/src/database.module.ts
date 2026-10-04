import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm-config.service';
import { AppConfigService } from '@app/config/config.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useClass: TypeOrmConfigService,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseLibModule {}
