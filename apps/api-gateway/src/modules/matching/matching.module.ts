import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { MatchEventsHandler } from './match-events.handler';
import { CompatibilityEngine } from './ai/compatibility.engine';
import { CandidateGenerator } from './ai/candidate.generator';
import { DiversityInjector } from './ai/diversity.injector';
import { BehaviorAnalyzer } from './ai/behavior.analyzer';
import { ScamDetector } from './ai/scam.detector';
import { IcebreakerGenerator } from './ai/icebreaker.generator';
import { MatchmakingEngine } from './ai/matchmaking.engine';
import {
  User, Profile, Like, Pass, Match, DailyLike, Photo,
  Conversation, ConversationParticipant, UserPreference,
  Notification, Block, Report, Interest, ProfileInterest,
  Session, Message,
} from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Profile, Like, Pass, Match, DailyLike, Photo,
      Conversation, ConversationParticipant, UserPreference,
      Notification, Block, Report, Interest, ProfileInterest,
      Session, Message,
    ]),
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService, MatchEventsHandler,
    CompatibilityEngine, CandidateGenerator, DiversityInjector,
    BehaviorAnalyzer, ScamDetector, IcebreakerGenerator, MatchmakingEngine,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
