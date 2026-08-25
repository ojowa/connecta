import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { allEntities } from '@app/common/entities';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { CompatibilityEngine } from './ai/compatibility.engine';
import { CandidateGenerator } from './ai/candidate.generator';
import { DiversityInjector } from './ai/diversity.injector';
import { BehaviorAnalyzer } from './ai/behavior.analyzer';
import { ScamDetector } from './ai/scam.detector';
import { IcebreakerGenerator } from './ai/icebreaker.generator';
import { MatchmakingEngine } from './ai/matchmaking.engine';
import { ToxicityDetector } from './ai/toxicity.detector';
import { FakeProfileDetector } from './ai/fake-profile.detector';

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
    EventEmitterModule.forRoot(),
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    CompatibilityEngine,
    CandidateGenerator,
    DiversityInjector,
    BehaviorAnalyzer,
    ScamDetector,
    IcebreakerGenerator,
    MatchmakingEngine,
    ToxicityDetector,
    FakeProfileDetector,
  ],
})
export class AppModule {}
