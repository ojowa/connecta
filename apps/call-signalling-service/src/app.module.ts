import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CallsGateway } from './calls.gateway';
import { CallSession, User } from '@app/common/entities';
import { AppConfigService } from '@app/config/config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || 'Aarinola',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: true,
    }),
    TypeOrmModule.forFeature([CallSession, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'connecta-dev-secret-key-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [CallsController],
  providers: [CallsService, CallsGateway],
})
export class AppModule {}
