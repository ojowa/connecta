import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { allEntities } from '@app/common/entities';

/**
 * Registers every repository on the single default connection and re-exports
 * them globally, so the merged service feature modules do not each need their
 * own TypeOrmModule.forFeature() call.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature(allEntities)],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
