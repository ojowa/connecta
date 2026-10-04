import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { allEntities } from '@app/common/entities';
import { TypeOrmConfigService } from '@app/database/typeorm-config.service';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { MatchingEnhancementService } from './matching-enhancement.service';
import { CompatibilityEngine } from './ai/compatibility.engine';
import { CandidateGenerator } from './ai/candidate.generator';
import { DiversityInjector } from './ai/diversity.injector';
import { BehaviorAnalyzer } from './ai/behavior.analyzer';
import { ScamDetector } from './ai/scam.detector';
import { IcebreakerGenerator } from './ai/icebreaker.generator';
import { MatchmakingEngine } from './ai/matchmaking.engine';
import { ToxicityDetector } from './ai/toxicity.detector';
import { FakeProfileDetector } from './ai/fake-profile.detector';
import { MatchEventsHandler } from './events/match-events.handler';
import { MomentCronService } from './crons/moment-cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(allEntities),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    MatchingEnhancementService,
    CompatibilityEngine,
    CandidateGenerator,
    DiversityInjector,
    BehaviorAnalyzer,
    ScamDetector,
    IcebreakerGenerator,
    MatchmakingEngine,
    ToxicityDetector,
    FakeProfileDetector,
    MatchEventsHandler,
    MomentCronService,
  ],
  exports: [MatchingEnhancementService],
})
export class AppModule {}
