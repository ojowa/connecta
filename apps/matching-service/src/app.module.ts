import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NatsModule } from '@app/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { MatchEventsHandler } from './events/match-events.handler';
import { CompatibilityEngine } from './ai/compatibility.engine';
import { CandidateGenerator } from './ai/candidate.generator';
import { DiversityInjector } from './ai/diversity.injector';
import { BehaviorAnalyzer } from './ai/behavior.analyzer';
import { ScamDetector } from './ai/scam.detector';
import { IcebreakerGenerator } from './ai/icebreaker.generator';
import { MatchmakingEngine } from './ai/matchmaking.engine';
import { User, Profile, Like, Pass, Match, DailyLike, Photo, Conversation, ConversationParticipant, UserPreference, Notification, Block, Report, Interest, ProfileInterest, Session, Message } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NatsModule,
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'connecta_db', autoLoadEntities: true, synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Profile, Like, Pass, Match, DailyLike, Photo, Conversation, ConversationParticipant, UserPreference, Notification, Block, Report, Interest, ProfileInterest, Session, Message]),
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    MatchEventsHandler,
    CompatibilityEngine,
    CandidateGenerator,
    DiversityInjector,
    BehaviorAnalyzer,
    ScamDetector,
    IcebreakerGenerator,
    MatchmakingEngine,
  ],
})
export class AppModule {}
