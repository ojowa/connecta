import { Module } from '@nestjs/common';

// auth
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';

// users
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';

// matching
import { MatchingController } from './modules/matching/matching.controller';
import { MatchingService } from './modules/matching/matching.service';
import { MatchingEnhancementService } from './modules/matching/matching-enhancement.service';
import { CompatibilityEngine } from './modules/matching/ai/compatibility.engine';
import { CandidateGenerator } from './modules/matching/ai/candidate.generator';
import { DiversityInjector } from './modules/matching/ai/diversity.injector';
import { BehaviorAnalyzer } from './modules/matching/ai/behavior.analyzer';
import { ScamDetector } from './modules/matching/ai/scam.detector';
import { IcebreakerGenerator } from './modules/matching/ai/icebreaker.generator';
import { MatchmakingEngine } from './modules/matching/ai/matchmaking.engine';
import { ToxicityDetector } from './modules/matching/ai/toxicity.detector';
import { FakeProfileDetector } from './modules/matching/ai/fake-profile.detector';
import { MatchEventsHandler } from './modules/matching/events/match-events.handler';
import { MomentCronService } from './modules/matching/crons/moment-cron.service';

// chat
import { ChatController } from './modules/chat/chat.controller';
import { ChatService } from './modules/chat/chat.service';

// calls
import { CallsController } from './modules/calls/calls.controller';
import { CallsService } from './modules/calls/calls.service';
import { CallsGateway } from './modules/calls/calls.gateway';

// media
import { MediaController } from './modules/media/media.controller';
import { MediaService } from './modules/media/media.service';

// payments
import { PaymentsController } from './modules/payments/payments.controller';
import { PaymentsService } from './modules/payments/payments.service';

// notifications
import { NotificationsController } from './modules/notifications/notifications.controller';
import { NotificationsService } from './modules/notifications/notifications.service';
import { NotificationEventsHandler } from './modules/notifications/notification-events.handler';

// search
import { SearchController } from './modules/search/search.controller';
import { SearchService } from './modules/search/search.service';

// content
import { ContentController } from './modules/content/content.controller';

// support
import { SupportController } from './modules/support/support.controller';

// admin
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';

/**
 * Each feature module below is one former microservice, minus its own
 * TypeOrmModule.forRoot(). The single database connection and the routers live
 * in the root MonolithModule, so these modules share one connection and are
 * mounted under their original service prefix (auth, users, matching, ...).
 */

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthFeatureModule {}

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersFeatureModule {}

@Module({
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
export class MatchingFeatureModule {}

@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatFeatureModule {}

@Module({
  controllers: [CallsController],
  providers: [CallsService, CallsGateway],
  exports: [CallsGateway],
})
export class CallsFeatureModule {}

@Module({
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaFeatureModule {}

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsFeatureModule {}

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationEventsHandler],
})
export class NotificationsFeatureModule {}

@Module({
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchFeatureModule {}

@Module({
  controllers: [ContentController],
})
export class ContentFeatureModule {}

@Module({
  controllers: [SupportController],
})
export class SupportFeatureModule {}

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminFeatureModule {}
