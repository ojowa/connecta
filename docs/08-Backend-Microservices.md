# Backend Microservices

## Connecta — NestJS Microservices Architecture

**Version:** 1.0.0
**Date:** July 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Microservices Breakdown](#3-microservices-breakdown)
4. [Shared Libraries](#4-shared-libraries)
5. [Inter-Service Communication](#5-inter-service-communication)
6. [Database Connection Management](#6-database-connection-management)
7. [Validation & Guards](#7-validation--guards)
8. [Rate Limiting](#8-rate-limiting)
9. [Health Checks](#9-health-checks)
10. [Graceful Shutdown](#10-graceful-shutdown)

---

## 1. Overview

Connecta's backend is built as a **NestJS monorepo** using microservice architecture. Each domain has its own service with independent deployment, database access, and lifecycle.

### Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | NestJS | TypeScript-first, modular, excellent DI |
| Monorepo Tool | Nest CLI + Nx (optional) | Native NestJS support, shared code |
| Language | TypeScript | Shared types with React Native client |
| Database ORM | TypeORM | PostgreSQL support, migrations, decorators |
| Cache | Redis (ioredis) | Session storage, rate limiting, pub/sub |
| Message Broker | NATS JetStream | Lightweight, fast, event-driven |
| API Protocol | HTTP REST + WebSocket | REST for CRUD, WS for real-time |
| Validation | class-validator + class-transformer | Decorator-based, type-safe |
| Logging | Pino | Structured JSON logging, high performance |
| Config | @nestjs/config | Environment-based configuration |

---

## 2. Monorepo Structure

### 2.1 Root Structure

```
connecta-backend/
├── apps/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── profile-service/
│   ├── matching-service/
│   ├── chat-service/
│   ├── call-signalling-service/
│   ├── media-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── search-service/
│   ├── admin-service/
│   ├── recommendation-engine/    # Python/FastAPI
│   ├── moderation-engine/        # Python/FastAPI
│   └── scam-detection/           # Python/FastAPI
├── libs/
│   ├── common/
│   │   ├── src/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── middleware/
│   │   │   ├── pipes/
│   │   │   ├── dto/
│   │   │   ├── interfaces/
│   │   │   ├── utils/
│   │   │   └── common.module.ts
│   │   └── package.json
│   ├── auth/
│   │   ├── src/
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   └── package.json
│   ├── database/
│   │   ├── src/
│   │   │   ├── database.module.ts
│   │   │   ├── database.config.ts
│   │   │   └── migrations/
│   │   └── package.json
│   ├── config/
│   │   ├── src/
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── nats.config.ts
│   │   │   └── config.module.ts
│   │   └── package.json
│   └── logger/
│       ├── src/
│       │   ├── logger.module.ts
│       │   ├── logger.service.ts
│       │   └── logger.interceptor.ts
│       └── package.json
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── docker-compose.yml
├── migrations/
├── scripts/
├── test/
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── package.json
└── README.md
```

### 2.2 Nest CLI Configuration

```json
// nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false,
    "tsConfigPath": "tsconfig.build.json"
  },
  "projects": {
    "api-gateway": {
      "type": "application",
      "root": "apps/api-gateway",
      "entryFile": "main",
      "sourceRoot": "apps/api-gateway/src"
    },
    "auth-service": {
      "type": "application",
      "root": "apps/auth-service",
      "entryFile": "main",
      "sourceRoot": "apps/auth-service/src"
    },
    "user-service": {
      "type": "application",
      "root": "apps/user-service",
      "entryFile": "main",
      "sourceRoot": "apps/user-service/src"
    },
    "profile-service": {
      "type": "application",
      "root": "apps/profile-service",
      "entryFile": "main",
      "sourceRoot": "apps/profile-service/src"
    },
    "matching-service": {
      "type": "application",
      "root": "apps/matching-service",
      "entryFile": "main",
      "sourceRoot": "apps/matching-service/src"
    },
    "chat-service": {
      "type": "application",
      "root": "apps/chat-service",
      "entryFile": "main",
      "sourceRoot": "apps/chat-service/src"
    },
    "call-signalling-service": {
      "type": "application",
      "root": "apps/call-signalling-service",
      "entryFile": "main",
      "sourceRoot": "apps/call-signalling-service/src"
    },
    "media-service": {
      "type": "application",
      "root": "apps/media-service",
      "entryFile": "main",
      "sourceRoot": "apps/media-service/src"
    },
    "payment-service": {
      "type": "application",
      "root": "apps/payment-service",
      "entryFile": "main",
      "sourceRoot": "apps/payment-service/src"
    },
    "notification-service": {
      "type": "application",
      "root": "apps/notification-service",
      "entryFile": "main",
      "sourceRoot": "apps/notification-service/src"
    },
    "search-service": {
      "type": "application",
      "root": "apps/search-service",
      "entryFile": "main",
      "sourceRoot": "apps/search-service/src"
    },
    "admin-service": {
      "type": "application",
      "root": "apps/admin-service",
      "entryFile": "main",
      "sourceRoot": "apps/admin-service/src"
    },
    "common": {
      "type": "library",
      "root": "libs/common",
      "entryFile": "index",
      "sourceRoot": "libs/common/src"
    },
    "auth": {
      "type": "library",
      "root": "libs/auth",
      "entryFile": "index",
      "sourceRoot": "libs/auth/src"
    },
    "database": {
      "type": "library",
      "root": "libs/database",
      "entryFile": "index",
      "sourceRoot": "libs/database/src"
    },
    "config": {
      "type": "library",
      "root": "libs/config",
      "entryFile": "index",
      "sourceRoot": "libs/config/src"
    },
    "logger": {
      "type": "library",
      "root": "libs/logger",
      "entryFile": "index",
      "sourceRoot": "libs/logger/src"
    }
  }
}
`

### 2.3 NPM Scripts

```json
{
  "scripts": {
    "build": "nest build",
    "build:api-gateway": "nest build api-gateway",
    "build:auth-service": "nest build auth-service",
    "start:api-gateway": "nest start api-gateway",
    "start:auth-service": "nest start auth-service",
    "start:user-service": "nest start user-service",
    "start:profile-service": "nest start profile-service",
    "start:matching-service": "nest start matching-service",
    "start:chat-service": "nest start chat-service",
    "start:call-signalling-service": "nest start call-signalling-service",
    "start:media-service": "nest start media-service",
    "start:payment-service": "nest start payment-service",
    "start:notification-service": "nest start notification-service",
    "start:search-service": "nest start search-service",
    "start:admin-service": "nest start admin-service",
    "start:dev": "concurrently \"npm run start:api-gateway\" \"npm run start:auth-service\" \"npm run start:user-service\"",
    "lint": "eslint \"{apps,libs}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm migration:generate -d libs/database/src/data-source.ts",
    "migration:run": "npm run typeorm migration:run -d libs/database/src/data-source.ts"
  }
}
`

### 2.4 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@app/common": ["libs/common/src"],
      "@app/common/*": ["libs/common/src/*"],
      "@app/auth": ["libs/auth/src"],
      "@app/auth/*": ["libs/auth/src/*"],
      "@app/database": ["libs/database/src"],
      "@app/database/*": ["libs/database/src/*"],
      "@app/config": ["libs/config/src"],
      "@app/config/*": ["libs/config/src/*"],
      "@app/logger": ["libs/logger/src"],
      "@app/logger/*": ["libs/logger/src/*"]
    }
  }
}
`

---

## 3. Microservices Breakdown

---

### 3.1 API Gateway Service

The API Gateway is the single entry point for all client requests. It handles routing, authentication validation, request transformation, rate limiting, and response aggregation.

#### Folder Structure

`
apps/api-gateway/
├── src/
│   ├── api-gateway.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── profiles.controller.ts
│   │   ├── matching.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── calls.controller.ts
│   │   ├── media.controller.ts
│   │   ├── payments.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── search.controller.ts
│   │   └── admin.controller.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── rate-limit.guard.ts
│   │   └── throttle.guard.ts
│   ├── interceptors/
│   │   ├── response-transform.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   ├── dto/
│   │   └── index.ts
│   ├── middleware/
│   │   ├── request-id.middleware.ts
│   │   └── device-info.middleware.ts
│   └── config/
│       └── gateway.config.ts
├── test/
│   └── api-gateway.e2e-spec.ts
├── tsconfig.app.json
└── tsconfig.json
```

#### Module Definition

```typescript
// apps/api-gateway/src/api-gateway.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { ProfilesController } from './controllers/profiles.controller';
import { MatchingController } from './controllers/matching.controller';
import { ChatController } from './controllers/chat.controller';
import { CallsController } from './controllers/calls.controller';
import { MediaController } from './controllers/media.controller';
import { PaymentsController } from './controllers/payments.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { SearchController } from './controllers/search.controller';
import { AdminController } from './controllers/admin.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { DeviceInfoMiddleware } from './middleware/device-info.middleware';
import { AppConfigModule } from '@app/config';
import { AppLoggerModule } from '@app/logger';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    ProfilesController,
    MatchingController,
    ChatController,
    CallsController,
    MediaController,
    PaymentsController,
    NotificationsController,
    SearchController,
    AdminController,
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, DeviceInfoMiddleware)
      .forRoutes('*');
  }
}
`

#### Main Entry Point

```typescript
// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { AppLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Connecta API')
    .setDescription('Connecta Dating App API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_GATEWAY_PORT || 3000;
  await app.listen(port);
  logger.log(API Gateway running on port , 'Bootstrap');
}

bootstrap();
`

#### Key Controller: Auth Controller

```typescript
// apps/api-gateway/src/controllers/auth.controller.ts
import {
  Controller, Post, Body, HttpCode, HttpStatus,
  UseGuards, Req, Get, Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto,
  ResetPasswordDto, VerifyEmailDto } from '@app/common/dto/auth';
import { Public } from '@app/auth/decorators/public.decorator';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @Public()
  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authClient.send('auth.register', dto);
  }

  @Post('login')
  @Public()
  @Throttle({ short: { ttl: 1000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authClient.send('auth.login', dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authClient.send('auth.refresh', dto);
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authClient.send('auth.forgot-password', dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authClient.send('auth.reset-password', dto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authClient.send('auth.verify-email', dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authClient.send('auth.get-me', userId);
  }

  @Delete('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@CurrentUser('id') userId: string, @Req() req: any) {
    return this.authClient.send('auth.logout', {
      userId,
      deviceId: req.headers['x-device-id'],
    });
  }
}
`

#### Key Controller: Matching Controller

```typescript
// apps/api-gateway/src/controllers/matching.controller.ts
import {
  Controller, Get, Post, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { SwipeDto, GetMatchesDto, GetFeedDto } from '@app/common/dto/matching';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(
    @Inject('MATCHING_SERVICE') private readonly matchingClient: ClientProxy,
  ) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get discovery feed' })
  async getFeed(
    @CurrentUser('id') userId: string,
    @Query() query: GetFeedDto,
  ) {
    return this.matchingClient.send('matching.get-feed', { userId, ...query });
  }

  @Post('swipe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Swipe right/left on a profile' })
  async swipe(
    @CurrentUser('id') userId: string,
    @Body() dto: SwipeDto,
  ) {
    return this.matchingClient.send('matching.swipe', { userId, ...dto });
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get all matches' })
  async getMatches(
    @CurrentUser('id') userId: string,
    @Query() query: GetMatchesDto,
  ) {
    return this.matchingClient.send('matching.get-matches', { userId, ...query });
  }

  @Get('matches/:matchId')
  @ApiOperation({ summary: 'Get match details' })
  async getMatchById(
    @CurrentUser('id') userId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.matchingClient.send('matching.get-match', { userId, matchId });
  }

  @Post('super-like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a super-like' })
  async superLike(
    @CurrentUser('id') userId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.matchingClient.send('matching.super-like', { userId, targetUserId });
  }

  @Post('boost')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate profile boost' })
  async activateBoost(@CurrentUser('id') userId: string) {
    return this.matchingClient.send('matching.activate-boost', { userId });
  }
}
`

#### Response Transform Interceptor

```typescript
// apps/api-gateway/src/interceptors/response-transform.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'];

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
            timestamp: new Date().toISOString(),
            requestId,
          };
        }
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
`

---

### 3.2 Auth Service

Handles authentication, authorization, token management, OAuth integration, and session tracking.

#### Folder Structure

`
apps/auth-service/
├── src/
│   ├── auth-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── session.service.ts
│   │   ├── password.service.ts
│   │   └── oauth.service.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── session.entity.ts
│   │   └── oauth-account.entity.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── forgot-password.dto.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-refresh.strategy.ts
│   │   └── google-oauth.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── local-auth.guard.ts
│   ├── event-handlers/
│   │   ├── user-events.handler.ts
│   │   └── payment-events.handler.ts
│   ├── migrations/
│   │   └── 1720000000000-CreateAuthTables.ts
│   └── config/
│       └── auth.config.ts
├── test/
│   ├── auth.service.spec.ts
│   └── auth.controller.spec.ts
├── tsconfig.app.json
└── tsconfig.json
`

#### Entity: User

```typescript
// apps/auth-service/src/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { Session } from './session.entity';
import { OAuthAccount } from './oauth-account.entity';

export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true, where: '"phone" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastActiveAt: Date;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ nullable: true })
  lockUntil: Date;

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];

  @OneToMany(() => OAuthAccount, (oauth) => oauth.user, { cascade: true })
  oauthAccounts: OAuthAccount[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`

#### Entity: Session

```typescript
// apps/auth-service/src/entities/session.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index(['userId', 'deviceId'])
@Index(['refreshToken'], { unique: true })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Auth Service Implementation

```typescript
// apps/auth-service/src/services/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException,
  NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { PasswordService } from './password.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly logger: AppLoggerService,
  ) {}

  async register(dto: RegisterDto, deviceInfo: any) {
    this.logger.log('Registration attempt', 'AuthService');

    const existingUser = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existingUser) {
      throw new RpcException(
        new ConflictException('User with this email or phone already exists'),
      );
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
    });

    const savedUser = await this.userRepo.save(user);

    const tokens = await this.tokenService.generateTokens(savedUser);
    await this.sessionService.create({
      userId: savedUser.id,
      ...deviceInfo,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    this.logger.log(User registered: , 'AuthService');

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(dto: LoginDto, deviceInfo: any) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new RpcException(new UnauthorizedException('Invalid credentials'));
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new RpcException(
        new UnauthorizedException('Account temporarily locked. Try again later.'),
      );
    }

    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new RpcException(new UnauthorizedException('Invalid credentials'));
    }

    await this.userRepo.update(user.id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      status: user.status === UserStatus.PENDING_VERIFICATION
        ? user.status
        : UserStatus.ACTIVE,
    });

    const tokens = await this.tokenService.generateTokens(user);
    await this.sessionService.create({
      userId: user.id,
      ...deviceInfo,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string, deviceInfo: any) {
    const session = await this.sessionService.findByRefreshToken(refreshToken);

    if (!session || !session.isActive) {
      throw new RpcException(new UnauthorizedException('Invalid refresh token'));
    }

    const user = await this.userRepo.findOne({ where: { id: session.userId } });

    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new RpcException(new UnauthorizedException('Account not available'));
    }

    await this.sessionService.deactivate(session.id);

    const tokens = await this.tokenService.generateTokens(user);
    await this.sessionService.create({
      userId: user.id,
      ...deviceInfo,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return tokens;
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.sessionService.deactivate(sessionId);
    } else {
      await this.sessionService.deactivateAllForUser(userId);
    }
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }
    return this.sanitizeUser(user);
  }

  private async handleFailedLogin(user: User) {
    const attempts = user.loginAttempts + 1;
    const update: Partial<User> = { loginAttempts: attempts };

    if (attempts >= 5) {
      update.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      this.logger.warn(Account locked: , 'AuthService');
    }

    await this.userRepo.update(user.id, update);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
`

#### Token Service

```typescript
// apps/auth-service/src/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
`

#### Event Handlers

```typescript
// apps/auth-service/src/event-handlers/user-events.handler.ts
import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { SessionService } from '../services/session.service';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class UserEventsHandler {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly sessionService: SessionService,
    private readonly logger: AppLoggerService,
  ) {}

  @EventPattern('user.deactivated')
  async handleUserDeactivated(@Payload() data: { userId: string }) {
    this.logger.log(Processing user deactivation: , 'UserEvents');
    await this.userRepo.update(data.userId, { status: UserStatus.DEACTIVATED });
    await this.sessionService.deactivateAllForUser(data.userId);
  }

  @EventPattern('user.suspended')
  async handleUserSuspended(@Payload() data: { userId: string; reason: string }) {
    this.logger.log(Processing user suspension: , 'UserEvents');
    await this.userRepo.update(data.userId, { status: UserStatus.SUSPENDED });
    await this.sessionService.deactivateAllForUser(data.userId);
  }

  @EventPattern('payment.subscription.expired')
  async handleSubscriptionExpired(@Payload() data: { userId: string }) {
    this.logger.log(Processing subscription expiry: , 'UserEvents');
    await this.userRepo.update(data.userId, { role: 'user' as any });
  }
}
`

---

### 3.3 User Service

Manages core user data, preferences, settings, and account operations.

#### Folder Structure

`
apps/user-service/
├── src/
│   ├── user-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── user-settings.service.ts
│   │   └── blocked-users.service.ts
│   ├── entities/
│   │   ├── user-settings.entity.ts
│   │   ├── blocked-user.entity.ts
│   │   └── report.entity.ts
│   ├── dto/
│   │   ├── update-user.dto.ts
│   │   ├── user-settings.dto.ts
│   │   ├── block-user.dto.ts
│   │   └── report-user.dto.ts
│   ├── event-handlers/
│   │   ├── auth-events.handler.ts
│   │   └── profile-events.handler.ts
│   └── repositories/
│       └── user.repository.ts
├── test/
└── tsconfig.app.json
`

#### Entity: User Settings

```typescript
// apps/user-service/src/entities/user-settings.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  matchNotifications: boolean;

  @Column({ default: true })
  messageNotifications: boolean;

  @Column({ default: true })
  likeNotifications: boolean;

  @Column({ default: 50 })
  maxDistance: number;

  @Column({ default: 18 })
  ageRangeMin: number;

  @Column({ default: 50 })
  ageRangeMax: number;

  @Column({ default: true })
  showDistance: boolean;

  @Column({ default: true })
  showAge: boolean;

  @Column({ default: false })
  incognitoMode: boolean;

  @Column({ default: false })
  hideProfile: boolean;

  @Column({ type: 'jsonb', default: { language: 'en', theme: 'light' } })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`

#### Entity: Blocked User

```typescript
// apps/user-service/src/entities/blocked-user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('blocked_users')
@Index(['blockerId', 'blockedId'], { unique: true })
export class BlockedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string;

  @Column()
  blockedId: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### User Service Implementation

```typescript
// apps/user-service/src/services/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserSettings } from '../entities/user-settings.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Report } from '../entities/report.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserSettingsDto } from '../dto/user-settings.dto';
import { BlockUserDto } from '../dto/block-user.dto';
import { ReportUserDto } from '../dto/report-user.dto';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepo: Repository<UserSettings>,
    @InjectRepository(BlockedUser)
    private readonly blockedRepo: Repository<BlockedUser>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    private readonly logger: AppLoggerService,
  ) {}

  async getSettings(userId: string) {
    let settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepo.create({ userId });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(userId: string, dto: UserSettingsDto) {
    let settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepo.create({ userId, ...dto });
    } else {
      Object.assign(settings, dto);
    }
    await this.settingsRepo.save(settings);
    return settings;
  }

  async blockUser(userId: string, dto: BlockUserDto) {
    const existing = await this.blockedRepo.findOne({
      where: { blockerId: userId, blockedId: dto.blockedUserId },
    });

    if (existing) {
      return existing;
    }

    const blocked = this.blockedRepo.create({
      blockerId: userId,
      blockedId: dto.blockedUserId,
      reason: dto.reason,
    });

    await this.blockedRepo.save(blocked);
    this.logger.log(User  blocked , 'UserService');
    return blocked;
  }

  async unblockUser(userId: string, blockedUserId: string) {
    await this.blockedRepo.delete({
      blockerId: userId,
      blockedId: blockedUserId,
    });
    return { success: true };
  }

  async getBlockedUsers(userId: string) {
    return this.blockedRepo.find({
      where: { blockerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const blocked = await this.blockedRepo.findOne({
      where: [
        { blockerId: userId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: userId },
      ],
    });
    return !!blocked;
  }

  async reportUser(userId: string, dto: ReportUserDto) {
    const report = this.reportRepo.create({
      reporterId: userId,
      reportedUserId: dto.reportedUserId,
      reason: dto.reason,
      description: dto.description,
    });

    await this.reportRepo.save(report);
    this.logger.log(
      User  reported : ,
      'UserService',
    );
    return report;
  }

  async getBlockedIds(userId: string): Promise<string[]> {
    const blocked = await this.blockedRepo.find({
      where: { blockerId: userId },
      select: ['blockedId'],
    });
    return blocked.map((b) => b.blockedId);
  }

  @EventPattern('auth.user.registered')
  async handleUserRegistered(
    @Payload() data: { userId: string; email: string },
  ) {
    this.logger.log(Creating settings for new user: , 'UserService');
    const settings = this.settingsRepo.create({ userId: data.userId });
    await this.settingsRepo.save(settings);
  }
}
`

---

### 3.4 Profile Service

Manages user profiles, photos, bio, interests, preferences, and profile completion.

#### Folder Structure

`
apps/profile-service/
├── src/
│   ├── profile-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── profile.controller.ts
│   ├── services/
│   │   ├── profile.service.ts
│   │   ├── photo.service.ts
│   │   └── interest.service.ts
│   ├── entities/
│   │   ├── profile.entity.ts
│   │   ├── photo.entity.ts
│   │   ├── interest.entity.ts
│   │   └── profile-interest.entity.ts
│   ├── dto/
│   │   ├── create-profile.dto.ts
│   │   ├── update-profile.dto.ts
│   │   ├── photo.dto.ts
│   │   └── profile-query.dto.ts
│   ├── event-handlers/
│   │   ├── user-events.handler.ts
│   │   └── media-events.handler.ts
│   └── repositories/
│       └── profile.repository.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Profile

```typescript
// apps/profile-service/src/entities/profile.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, Index,
} from 'typeorm';
import { Photo } from './photo.entity';
import { Interest } from './interest.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
}

export enum RelationshipGoal {
  RELATIONSHIP = 'relationship',
  CASUAL = 'casual',
  FRIENDSHIP = 'friendship',
  UNSURE = 'unsure',
}

@Entity('profiles')
@Index(['userId'], { unique: true })
@Index(['location'])
@Index(['gender'])
@Index(['dateOfBirth'])
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  showGender: boolean;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  school: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'enum', enum: RelationshipGoal, nullable: true })
  relationshipGoal: RelationshipGoal;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  completionPercentage: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Photo, (photo) => photo.profile, { cascade: true })
  photos: Photo[];

  @ManyToMany(() => Interest, (interest) => interest.profiles)
  @JoinTable({
    name: 'profile_interests',
    joinColumn: { name: 'profileId' },
    inverseJoinColumn: { name: 'interestId' },
  })
  interests: Interest[];

  @Column({ type: 'jsonb', nullable: true })
  prompts: Array<{
    question: string;
    answer: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`

#### Entity: Photo

```typescript
// apps/profile-service/src/entities/photo.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('photos')
@Index(['profileId', 'order'])
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  profileId: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  cdnUrl: string;

  @Column()
  order: number;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  moderationStatus: string;

  @ManyToOne(() => Profile, (profile) => profile.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Interest Entity

```typescript
// apps/profile-service/src/entities/interest.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('interests')
export class Interest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Profile, (profile) => profile.interests)
  profiles: Profile[];
}
`

#### Profile Service Implementation

```typescript
// apps/profile-service/src/services/profile.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { EventPattern, Payload, ClientProxy, Inject } from '@nestjs/microservices';
import { Profile } from '../entities/profile.entity';
import { Photo } from '../entities/photo.entity';
import { Interest } from '../entities/interest.entity';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Photo)
    private readonly photoRepo: Repository<Photo>,
    @InjectRepository(Interest)
    private readonly interestRepo: Repository<Interest>,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {}

  async create(userId: string, dto: CreateProfileDto) {
    const existing = await this.profileRepo.findOne({ where: { userId } });
    if (existing) {
      throw new RpcException(
        new BadRequestException('Profile already exists for this user'),
      );
    }

    const profile = this.profileRepo.create({ userId, ...dto });

    if (dto.interestIds?.length) {
      profile.interests = await this.interestRepo.findBy({ id: In(dto.interestIds) });
    }

    const saved = await this.profileRepo.save(profile);
    this.calculateCompletion(saved);

    this.userClient.emit('profile.created', { userId, profileId: saved.id });
    return saved;
  }

  async findByUserId(userId: string) {
    const profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['photos', 'interests'],
    });
    if (!profile) {
      throw new RpcException(new NotFoundException('Profile not found'));
    }
    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new RpcException(new NotFoundException('Profile not found'));
    }

    if (dto.interestIds) {
      profile.interests = await this.interestRepo.findBy({ id: In(dto.interestIds) });
    }

    Object.assign(profile, dto);
    const saved = await this.profileRepo.save(profile);
    this.calculateCompletion(saved);
    return saved;
  }

  async addPhoto(userId: string, photoUrl: string, isPrimary = false) {
    const profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['photos'],
    });

    if (!profile) {
      throw new RpcException(new NotFoundException('Profile not found'));
    }

    if (profile.photos.length >= 9) {
      throw new RpcException(new BadRequestException('Maximum 9 photos allowed'));
    }

    const maxOrder = profile.photos.reduce((max, p) => Math.max(max, p.order), -1);

    const photo = this.photoRepo.create({
      profileId: profile.id,
      url: photoUrl,
      order: maxOrder + 1,
      isPrimary,
    });

    if (isPrimary) {
      await this.photoRepo.update({ profileId: profile.id }, { isPrimary: false });
    }

    return this.photoRepo.save(photo);
  }

  async removePhoto(userId: string, photoId: string) {
    const photo = await this.photoRepo.findOne({
      where: { id: photoId },
      relations: ['profile'],
    });

    if (!photo || photo.profile.userId !== userId) {
      throw new RpcException(new NotFoundException('Photo not found'));
    }

    if (photo.isPrimary) {
      throw new RpcException(new BadRequestException('Cannot delete primary photo'));
    }

    await this.photoRepo.remove(photo);
    this.mediaClient.emit('media.delete', { url: photo.url });
    return { success: true };
  }

  private calculateCompletion(profile: Profile) {
    let score = 0;
    const checks = [
      profile.firstName,
      profile.bio,
      profile.dateOfBirth,
      profile.gender,
      profile.photos?.length > 0,
      profile.interests?.length > 0,
      profile.jobTitle,
      profile.school,
      profile.relationshipGoal,
    ];

    checks.forEach((check) => {
      if (check) score += Math.floor(100 / checks.length);
    });

    profile.completionPercentage = Math.min(score, 100);
  }

  @EventPattern('user.deactivated')
  async handleUserDeactivated(@Payload() data: { userId: string }) {
    await this.profileRepo.update({ userId: data.userId }, { isActive: false });
  }
}
`

---

### 3.5 Matching Service

Handles the swipe logic, match creation, discovery feed, boost mechanics, and algorithm orchestration.

#### Folder Structure

`
apps/matching-service/
├── src/
│   ├── matching-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── matching.controller.ts
│   ├── services/
│   │   ├── matching.service.ts
│   │   ├── feed.service.ts
│   │   ├── boost.service.ts
│   │   └── algorithm.service.ts
│   ├── entities/
│   │   ├── swipe.entity.ts
│   │   ├── match.entity.ts
│   │   ├── boost.entity.ts
│   │   └── super-like.entity.ts
│   ├── dto/
│   │   ├── swipe.dto.ts
│   │   ├── get-feed.dto.ts
│   │   └── get-matches.dto.ts
│   ├── event-handlers/
│   │   ├── profile-events.handler.ts
│   │   └── payment-events.handler.ts
│   └── strategies/
│       └── elo-rating.strategy.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Swipe

```typescript
// apps/matching-service/src/entities/swipe.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum SwipeAction {
  LIKE = 'like',
  DISLIKE = 'dislike',
  SUPER_LIKE = 'super_like',
}

@Entity('swipes')
@Index(['swiperId', 'swipedId'], { unique: true })
@Index(['swipedId', 'action'])
@Index(['createdAt'])
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  swiperId: string;

  @Column()
  swipedId: string;

  @Column({ type: 'enum', enum: SwipeAction })
  action: SwipeAction;

  @Column({ nullable: true })
  matchId: string;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Entity: Match

```typescript
// apps/matching-service/src/entities/match.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum MatchStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  UNMATCHED = 'unmatched',
}

@Entity('matches')
@Index(['user1Id', 'user2Id'], { unique: true })
@Index(['user1Id', 'status'])
@Index(['user2Id', 'status'])
@Index(['createdAt'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user1Id: string;

  @Column()
  user2Id: string;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.ACTIVE })
  status: MatchStatus;

  @Column({ nullable: true })
  initiatedBySwipe: string;

  @Column({ default: false })
  isSuperLike: boolean;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Entity: Boost

```typescript
// apps/matching-service/src/entities/boost.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum BoostStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity('boosts')
@Index(['userId', 'status'])
export class Boost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: BoostStatus, default: BoostStatus.AVAILABLE })
  status: BoostStatus;

  @Column({ nullable: true })
  activatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  usedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Matching Service Implementation

```typescript
// apps/matching-service/src/services/matching.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { EventPattern, Payload, ClientProxy, Inject } from '@nestjs/microservices';
import { Swipe, SwipeAction } from '../entities/swipe.entity';
import { Match, MatchStatus } from '../entities/match.entity';
import { Boost } from '../entities/boost.entity';
import { SuperLike } from '../entities/super-like.entity';
import { SwipeDto } from '../dto/swipe.dto';
import { GetFeedDto } from '../dto/get-feed.dto';
import { GetMatchesDto } from '../dto/get-matches.dto';
import { FeedService } from './feed.service';
import { BoostService } from './boost.service';
import { AlgorithmService } from './algorithm.service';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Boost)
    private readonly boostRepo: Repository<Boost>,
    @InjectRepository(SuperLike)
    private readonly superLikeRepo: Repository<SuperLike>,
    private readonly feedService: FeedService,
    private readonly boostService: BoostService,
    private readonly algorithmService: AlgorithmService,
    @Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {}

  async getFeed(userId: string, query: GetFeedDto) {
    const swipedIds = await this.getSwipedIds(userId);
    const blockedIds = await this.getBlockedIds(userId);
    const excludeIds = [...new Set([...swipedIds, ...blockedIds])];

    const profile = await this.feedService.getUserProfile(userId);
    const feed = await this.feedService.getDiscoveryFeed(userId, excludeIds, {
      latitude: profile.latitude,
      longitude: profile.longitude,
      maxDistance: query.maxDistance || 50,
      minAge: query.minAge || 18,
      maxAge: query.maxAge || 50,
      gender: query.gender,
    });

    const scored = await this.algorithmService.scoreProfiles(userId, feed);
    return scored.slice(0, query.limit || 20);
  }

  async swipe(userId: string, dto: SwipeDto) {
    if (userId === dto.targetUserId) {
      throw new RpcException(new BadRequestException('Cannot swipe on yourself'));
    }

    const existingSwipe = await this.swipeRepo.findOne({
      where: { swiperId: userId, swipedId: dto.targetUserId },
    });

    if (existingSwipe) {
      throw new RpcException(new BadRequestException('Already swiped on this user'));
    }

    const swipe = this.swipeRepo.create({
      swiperId: userId,
      swipedId: dto.targetUserId,
      action: dto.action,
    });

    await this.swipeRepo.save(swipe);

    if (dto.action === SwipeAction.LIKE || dto.action === SwipeAction.SUPER_LIKE) {
      const mutualSwipe = await this.swipeRepo.findOne({
        where: {
          swiperId: dto.targetUserId,
          swipedId: userId,
          action: In([SwipeAction.LIKE, SwipeAction.SUPER_LIKE]),
        },
      });

      if (mutualSwipe) {
        const match = await this.createMatch(
          userId,
          dto.targetUserId,
          dto.action === SwipeAction.SUPER_LIKE,
        );

        this.notificationClient.emit('notification.match', {
          userId,
          targetUserId: dto.targetUserId,
          matchId: match.id,
        });

        return { matched: true, match };
      }
    }

    if (dto.action === SwipeAction.LIKE) {
      this.algorithmService.recordSwipe(userId, dto.targetUserId, true);
    }

    return { matched: false };
  }

  async superLike(userId: string, targetUserId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const superLikeCount = await this.superLikeRepo
      .createQueryBuilder('sl')
      .where('sl.userId = :userId', { userId })
      .andWhere('sl.createdAt >= :today', { today })
      .getCount();

    if (superLikeCount >= 3) {
      throw new RpcException(new BadRequestException('Daily super-like limit reached'));
    }

    const superLike = this.superLikeRepo.create({ userId, targetUserId });
    await this.superLikeRepo.save(superLike);

    return this.swipe(userId, {
      targetUserId,
      action: SwipeAction.SUPER_LIKE,
    });
  }

  async getMatches(userId: string, query: GetMatchesDto) {
    const qb = this.matchRepo
      .createQueryBuilder('match')
      .where('(match.user1Id = :userId OR match.user2Id = :userId)', { userId })
      .andWhere('match.status = :status', { status: MatchStatus.ACTIVE })
      .orderBy('match.lastMessageAt', 'NULLS LAST')
      .addOrderBy('match.createdAt', 'DESC');

    if (query.unreadOnly) {
      qb.andWhere('match.isRead = false');
    }

    return qb.getMany();
  }

  async getMatchById(userId: string, matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) {
      throw new RpcException(new NotFoundException('Match not found'));
    }
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new RpcException(new NotFoundException('Match not found'));
    }
    return match;
  }

  async unmatch(userId: string, matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) {
      throw new RpcException(new NotFoundException('Match not found'));
    }
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new RpcException(new NotFoundException('Match not found'));
    }

    match.status = MatchStatus.UNMATCHED;
    await this.matchRepo.save(match);

    this.chatClient.emit('chat.match.unmatched', { matchId });
    return { success: true };
  }

  async activateBoost(userId: string) {
    return this.boostService.activate(userId);
  }

  private async createMatch(
    user1Id: string,
    user2Id: string,
    isSuperLike: boolean,
  ): Promise<Match> {
    const [orderedUser1, orderedUser2] = [user1Id, user2Id].sort();

    const match = this.matchRepo.create({
      user1Id: orderedUser1,
      user2Id: orderedUser2,
      initiatedBySwipe: user1Id,
      isSuperLike,
    });

    return this.matchRepo.save(match);
  }

  private async getSwipedIds(userId: string): Promise<string[]> {
    const swipes = await this.swipeRepo.find({
      where: { swiperId: userId },
      select: ['swipedId'],
    });
    return swipes.map((s) => s.swipedId);
  }

  private async getBlockedIds(userId: string): Promise<string[]> {
    try {
      const result = await this.notificationClient
        .send('user.blocked-ids', userId)
        .toPromise();
      return result || [];
    } catch {
      return [];
    }
  }

  @EventPattern('profile.updated')
  async handleProfileUpdated(@Payload() data: { userId: string; profile: any }) {
    this.logger.log(Profile updated for feed: , 'MatchingService');
    await this.feedService.invalidateCache(data.userId);
  }

  @EventPattern('payment.boost.purchased')
  async handleBoostPurchased(@Payload() data: { userId: string; boostId: string }) {
    this.logger.log(Boost purchased: , 'MatchingService');
    await this.boostService.grantBoost(data.userId);
  }
}
`

---
### 3.7 Call Signalling Service

Handles WebRTC signalling for audio/video calls, call state management, and call quality monitoring.

#### Folder Structure

`
apps/call-signalling-service/
├── src/
│   ├── call-signalling.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── call.controller.ts
│   ├── services/
│   │   ├── call.service.ts
│   │   └── ice-candidate.service.ts
│   ├── entities/
│   │   ├── call.entity.ts
│   │   └── call-log.entity.ts
│   ├── dto/
│   │   ├── initiate-call.dto.ts
│   │   └── call-signalling.dto.ts
│   ├── gateways/
│   │   ├── call.gateway.ts
│   │   └── ws-call.guard.ts
│   └── event-handlers/
│       └── match-events.handler.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Call

```typescript
// apps/call-signalling-service/src/entities/call.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum CallStatus {
  RINGING = 'ringing',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  MISSED = 'missed',
  ENDED = 'ended',
  FAILED = 'failed',
}

@Entity('calls')
@Index(['callerId', 'createdAt'])
@Index(['calleeId', 'createdAt'])
@Index(['matchId'])
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @Column()
  callerId: string;

  @Column()
  calleeId: string;

  @Column({ type: 'enum', enum: CallType })
  type: CallType;

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.RINGING })
  status: CallStatus;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  answeredAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  endReason: string;

  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics: {
    latency: number;
    bitrate: number;
    packetLoss: number;
    jitter: number;
  };

  @Column({ default: false })
  isVideoEnabled: boolean;

  @Column({ default: false })
  isAudioEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`

#### Call Gateway

```typescript
// apps/call-signalling-service/src/gateways/call.gateway.ts
import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { WsCallGuard } from './ws-call.guard';
import { CallService } from '../services/call.service';
import { AppLoggerService } from '@app/logger';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/calls',
  transports: ['websocket'],
})
@Injectable()
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly callService: CallService,
    private readonly logger: AppLoggerService,
  ) {}

  @UseGuards(WsCallGuard)
  async handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    client.data.userId = userId;
    client.join('user:' + userId);
    this.logger.log('Call client connected: ' + client.id, 'CallGateway');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Call client disconnected: ' + client.id, 'CallGateway');
  }

  @SubscribeMessage('call:initiate')
  @UseGuards(WsCallGuard)
  async handleInitiateCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { matchId: string; calleeId: string; type: string },
  ) {
    const callerId = client.data.userId;
    const call = await this.callService.initiateCall(
      callerId,
      payload.matchId,
      payload.calleeId,
      payload.type as any,
    );

    this.server.to('user:' + payload.calleeId).emit('call:incoming', {
      callId: call.id,
      callerId,
      type: call.type,
    });

    return { event: 'call:initiated', data: { callId: call.id } };
  }

  @SubscribeMessage('call:accept')
  @UseGuards(WsCallGuard)
  async handleAcceptCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callId: string },
  ) {
    const userId = client.data.userId;
    const call = await this.callService.acceptCall(payload.callId, userId);

    this.server.to('user:' + call.callerId).emit('call:accepted', {
      callId: call.id,
      calleeId: userId,
    });

    return { event: 'call:accepted', data: { callId: call.id } };
  }

  @SubscribeMessage('call:reject')
  @UseGuards(WsCallGuard)
  async handleRejectCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callId: string },
  ) {
    const userId = client.data.userId;
    const call = await this.callService.rejectCall(payload.callId, userId);

    this.server.to('user:' + call.callerId).emit('call:rejected', {
      callId: call.id,
      calleeId: userId,
    });
  }

  @SubscribeMessage('call:offer')
  @UseGuards(WsCallGuard)
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callId: string; offer: any },
  ) {
    const call = await this.callService.getCall(payload.callId);
    const targetUserId =
      call.callerId === client.data.userId ? call.calleeId : call.callerId;

    this.server.to('user:' + targetUserId).emit('call:offer', {
      callId: payload.callId,
      offer: payload.offer,
      from: client.data.userId,
    });
  }

  @SubscribeMessage('call:answer')
  @UseGuards(WsCallGuard)
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callId: string; answer: any },
  ) {
    const call = await this.callService.getCall(payload.callId);
    const targetUserId =
      call.callerId === client.data.userId ? call.calleeId : call.callerId;

    this.server.to('user:' + targetUserId).emit('call:answer', {
      callId: payload.callId,
      answer: payload.answer,
      from: client.data.userId,
    });
  }

  @SubscribeMessage('call:ice-candidate')
  @UseGuards(WsCallGuard)
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callId: string; candidate: any },
  ) {
    const call = await this.callService.getCall(payload.callId);
    const targetUserId =
      call.callerId === client.data.userId ? call.calleeId : call.callerId;

    this.server.to('user:' + targetUserId).emit('call:ice-candidate', {
      callId: payload.callId,
      candidate: payload.candidate,
      from: client.data.userId,
    });
  }

  @SubscribeMessage('call:end')
  @UseGuards(WsCallGuard)
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callId: string },
  ) {
    const userId = client.data.userId;
    const call = await this.callService.endCall(payload.callId, userId);
    const targetUserId =
      call.callerId === userId ? call.calleeId : call.callerId;

    this.server.to('user:' + targetUserId).emit('call:ended', {
      callId: call.id,
      endedBy: userId,
    });
  }
}
`

---
### 3.8 Media Service

Handles file uploads, image processing, CDN management, and media moderation.

#### Folder Structure

`
apps/media-service/
├── src/
│   ├── media-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── media.controller.ts
│   ├── services/
│   │   ├── media.service.ts
│   │   ├── upload.service.ts
│   │   ├── image-processor.service.ts
│   │   ├── cdn.service.ts
│   │   └── moderation.service.ts
│   ├── entities/
│   │   ├── media.entity.ts
│   │   └── upload-queue.entity.ts
│   ├── dto/
│   │   ├── upload.dto.ts
│   │   └── media-query.dto.ts
│   ├── event-handlers/
│   │   └── moderation-events.handler.ts
│   ├── processors/
│   │   └── image.processor.ts
│   └── strategies/
│       └── s3.storage.strategy.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Media

```typescript
// apps/media-service/src/entities/media.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum MediaStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  MODERATED = 'moderated',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('media')
@Index(['userId', 'type'])
@Index(['status'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  storageKey: string;

  @Column({ nullable: true })
  cdnUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: MediaStatus, default: MediaStatus.UPLOADING })
  status: MediaStatus;

  @Column({
    type: 'enum',
    enum: ModerationStatus,
    default: ModerationStatus.PENDING,
  })
  moderationStatus: ModerationStatus;

  @Column({ nullable: true })
  moderationReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    blurhash?: string;
  };

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Media Service Implementation

```typescript
// apps/media-service/src/services/media.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  Media, MediaType, MediaStatus, ModerationStatus,
} from '../entities/media.entity';
import { UploadService } from './upload.service';
import { ImageProcessorService } from './image-processor.service';
import { CdnService } from './cdn.service';
import { ModerationService } from './moderation.service';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly uploadService: UploadService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly cdnService: CdnService,
    private readonly moderationService: ModerationService,
    private readonly logger: AppLoggerService,
  ) {}

  async upload(userId: string, file: Express.Multer.File) {
    if (file.size > 10 * 1024 * 1024) {
      throw new RpcException(
        new BadRequestException('File size must be less than 10MB'),
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new RpcException(new BadRequestException('File type not allowed'));
    }

    const media = this.mediaRepo.create({
      userId,
      type: this.getMediaType(file.mimetype),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey: '',
      status: MediaStatus.UPLOADING,
    });

    const saved = await this.mediaRepo.save(media);

    try {
      const storageKey = await this.uploadService.upload(saved.id, file);
      saved.storageKey = storageKey;

      if (saved.type === MediaType.IMAGE) {
        saved.status = MediaStatus.PROCESSING;
        await this.mediaRepo.save(saved);

        const processed = await this.imageProcessor.process(file.buffer, saved.id);
        saved.thumbnailUrl = processed.thumbnailUrl;
        saved.cdnUrl = processed.cdnUrl;
        saved.metadata = processed.metadata;
      } else {
        saved.cdnUrl = await this.cdnService.getUrl(saved.storageKey);
      }

      saved.status = MediaStatus.READY;
      await this.mediaRepo.save(saved);

      this.moderationService.submitForModeration(saved.id);
      return saved;
    } catch (error) {
      saved.status = MediaStatus.FAILED;
      await this.mediaRepo.save(saved);
      throw error;
    }
  }

  async getMedia(userId: string, mediaId: string) {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) {
      throw new RpcException(new NotFoundException('Media not found'));
    }
    if (media.userId !== userId) {
      throw new RpcException(new NotFoundException('Media not found'));
    }
    return media;
  }

  async deleteMedia(userId: string, mediaId: string) {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media || media.userId !== userId) {
      throw new RpcException(new NotFoundException('Media not found'));
    }
    await this.uploadService.delete(media.storageKey);
    if (media.thumbnailUrl) {
      await this.uploadService.delete(media.thumbnailUrl);
    }
    await this.mediaRepo.remove(media);
    return { success: true };
  }

  async getUserMedia(userId: string, type?: MediaType) {
    const where: any = { userId, status: MediaStatus.READY };
    if (type) where.type = type;
    return this.mediaRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getSignedUploadUrl(userId: string, fileName: string, mimeType: string) {
    return this.uploadService.getSignedUrl(userId, fileName, mimeType);
  }

  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }

  @EventPattern('media.moderation.complete')
  async handleModerationComplete(
    @Payload() data: { mediaId: string; approved: boolean; reason?: string },
  ) {
    const media = await this.mediaRepo.findOne({ where: { id: data.mediaId } });
    if (!media) return;

    media.moderationStatus = data.approved
      ? ModerationStatus.APPROVED
      : ModerationStatus.REJECTED;
    media.moderationReason = data.reason;

    if (!data.approved) {
      media.status = MediaStatus.MODERATED;
    }

    await this.mediaRepo.save(media);
  }
}
`

---
### 3.9 Payment Service

Handles subscriptions, in-app purchases, payment processing, receipt validation, and billing management.

#### Folder Structure

`
apps/payment-service/
├── src/
│   ├── payment-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── payment.controller.ts
│   ├── services/
│   │   ├── payment.service.ts
│   │   ├── subscription.service.ts
│   │   ├── in-app-purchase.service.ts
│   │   └── receipt-validator.service.ts
│   ├── entities/
│   │   ├── subscription.entity.ts
│   │   ├── payment.entity.ts
│   │   ├── invoice.entity.ts
│   │   └── promo-code.entity.ts
│   ├── dto/
│   │   ├── create-subscription.dto.ts
│   │   ├── purchase.dto.ts
│   │   └── validate-receipt.dto.ts
│   ├── event-handlers/
│   │   └── apple-webhook.handler.ts
│   ├── strategies/
│   │   ├── stripe.strategy.ts
│   │   └── apple-iap.strategy.ts
│   └── webhooks/
│       ├── stripe.webhook.ts
│       └── apple.webhook.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Subscription

```typescript
// apps/payment-service/src/entities/subscription.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum SubscriptionPlan {
  FREE = 'free',
  PLUS = 'plus',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
  IN_TRIAL = 'in_trial',
  PAST_DUE = 'past_due',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  APPLE = 'apple',
  GOOGLE = 'google',
}

@Entity('subscriptions')
@Index(['userId', 'status'])
@Index(['stripeSubscriptionId'], {
  unique: true,
  where: '"stripeSubscriptionId" IS NOT NULL',
})
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  appleOriginalTransactionId: string;

  @Column({ nullable: true })
  googlePurchaseToken: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  currentPeriodStart: Date;

  @Column({ nullable: true })
  currentPeriodEnd: Date;

  @Column({ nullable: true })
  cancelAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  trialStart: Date;

  @Column({ nullable: true })
  trialEnd: Date;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ default: 0 })
  boostCredits: number;

  @Column({ default: 3 })
  superLikeCredits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`

#### Payment Service Implementation

```typescript
// apps/payment-service/src/services/payment.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { EventPattern, Payload, ClientProxy, Inject } from '@nestjs/microservices';
import {
  Subscription, SubscriptionPlan, SubscriptionStatus, PaymentProvider,
} from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';
import { Invoice } from '../entities/invoice.entity';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('MATCHING_SERVICE')
    private readonly matchingClient: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {}

  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    provider: PaymentProvider,
    paymentMethodId?: string,
  ) {
    const existing = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (existing && existing.plan !== SubscriptionPlan.FREE) {
      throw new RpcException(
        new BadRequestException('Active subscription already exists'),
      );
    }

    const subscription = this.subscriptionRepo.create({
      userId,
      plan,
      provider,
      status: SubscriptionStatus.ACTIVE,
      features: this.getPlanFeatures(plan),
      boostCredits: this.getPlanBoosts(plan),
      superLikeCredits: this.getPlanSuperLikes(plan),
    });

    await this.subscriptionRepo.save(subscription);

    this.notificationClient.emit('notification.subscription.activated', {
      userId,
      plan,
    });

    this.matchingClient.emit('payment.subscription.activated', {
      userId,
      plan,
    });

    return subscription;
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription || subscription.plan === SubscriptionPlan.FREE) {
      throw new RpcException(
        new BadRequestException('No active subscription to cancel'),
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    await this.subscriptionRepo.save(subscription);

    this.notificationClient.emit('notification.subscription.cancelled', {
      userId,
      plan: subscription.plan,
    });

    return subscription;
  }

  async getSubscription(userId: string) {
    return this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
  }

  async purchaseBoost(userId: string, boostType: string) {
    const subscription = await this.getOrCreateFreeSubscription(userId);

    if (subscription.boostCredits <= 0) {
      throw new RpcException(
        new BadRequestException('No boost credits remaining'),
      );
    }

    subscription.boostCredits -= 1;
    await this.subscriptionRepo.save(subscription);

    this.matchingClient.emit('payment.boost.purchased', {
      userId,
      boostType,
    });

    return { success: true, boostCredits: subscription.boostCredits };
  }

  async getInvoices(userId: string) {
    return this.invoiceRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  private async getOrCreateFreeSubscription(userId: string): Promise<Subscription> {
    let subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription) {
      subscription = this.subscriptionRepo.create({
        userId,
        plan: SubscriptionPlan.FREE,
        provider: PaymentProvider.STRIPE,
        status: SubscriptionStatus.ACTIVE,
        features: [],
        boostCredits: 0,
        superLikeCredits: 3,
      });
      await this.subscriptionRepo.save(subscription);
    }

    return subscription;
  }

  private getPlanFeatures(plan: SubscriptionPlan): string[] {
    const features: Record<SubscriptionPlan, string[]> = {
      [SubscriptionPlan.FREE]: [],
      [SubscriptionPlan.PLUS]: [
        'unlimited_likes', 'see_who_liked', '5_boosts',
      ],
      [SubscriptionPlan.GOLD]: [
        'unlimited_likes', 'see_who_liked', '10_boosts',
        'profile_boost', 'advanced_filters',
      ],
      [SubscriptionPlan.PLATINUM]: [
        'unlimited_likes', 'see_who_liked', 'unlimited_boosts',
        'profile_boost', 'advanced_filters', 'priority_support',
        'read_receipts',
      ],
    };
    return features[plan];
  }

  private getPlanBoosts(plan: SubscriptionPlan): number {
    const boosts: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PLUS]: 5,
      [SubscriptionPlan.GOLD]: 10,
      [SubscriptionPlan.PLATINUM]: 999,
    };
    return boosts[plan];
  }

  private getPlanSuperLikes(plan: SubscriptionPlan): number {
    const superLikes: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 3,
      [SubscriptionPlan.PLUS]: 5,
      [SubscriptionPlan.GOLD]: 10,
      [SubscriptionPlan.PLATINUM]: 15,
    };
    return superLikes[plan];
  }

  @EventPattern('payment.stripe.webhook')
  async handleStripeWebhook(
    @Payload() data: { type: string; subscription: any },
  ) {
    this.logger.log('Processing Stripe webhook: ' + data.type, 'PaymentService');

    switch (data.type) {
      case 'invoice.paid':
        await this.handleInvoicePaid(data.subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(data.subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(data.subscription);
        break;
    }
  }

  private async handleInvoicePaid(subscriptionData: any) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: subscriptionData.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.currentPeriodStart = new Date(
        subscriptionData.current_period_start * 1000,
      );
      subscription.currentPeriodEnd = new Date(
        subscriptionData.current_period_end * 1000,
      );
      await this.subscriptionRepo.save(subscription);
    }
  }

  private async handlePaymentFailed(subscriptionData: any) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: subscriptionData.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.PAST_DUE;
      await this.subscriptionRepo.save(subscription);
    }
  }

  private async handleSubscriptionDeleted(subscriptionData: any) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: subscriptionData.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      await this.subscriptionRepo.save(subscription);
    }
  }
}
`

---
### 3.10 Notification Service

Handles push notifications, in-app notifications, email notifications, and notification preferences.

#### Folder Structure

`
apps/notification-service/
├── src/
│   ├── notification-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── notification.controller.ts
│   ├── services/
│   │   ├── notification.service.ts
│   │   ├── push-notification.service.ts
│   │   ├── email-notification.service.ts
│   │   ├── in-app-notification.service.ts
│   │   └── notification-template.service.ts
│   ├── entities/
│   │   ├── notification.entity.ts
│   │   ├── device-token.entity.ts
│   │   └── notification-preference.entity.ts
│   ├── dto/
│   │   ├── send-notification.dto.ts
│   │   └── notification-query.dto.ts
│   ├── event-handlers/
│   │   ├── match-events.handler.ts
│   │   ├── message-events.handler.ts
│   │   ├── payment-events.handler.ts
│   │   └── admin-events.handler.ts
│   ├── templates/
│   │   ├── welcome.hbs
│   │   ├── match.hbs
│   │   └── subscription.hbs
│   └── providers/
│       ├── fcm.provider.ts
│       └── sendgrid.provider.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Notification

```typescript
// apps/notification-service/src/entities/notification.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum NotificationType {
  MATCH = 'match',
  MESSAGE = 'message',
  LIKE = 'like',
  SUPER_LIKE = 'super_like',
  PROFILE_VIEW = 'profile_view',
  SUBSCRIPTION = 'subscription',
  SYSTEM = 'system',
  PROMOTION = 'promotion',
  SECURITY = 'security',
}

export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  IN_APP = 'in_app',
  SMS = 'sms',
}

@Entity('notifications')
@Index(['userId', 'readAt'])
@Index(['userId', 'type'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  actionUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  clickedAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Entity: Device Token

```typescript
// apps/notification-service/src/entities/device-token.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('device_tokens')
@Index(['userId', 'token'], { unique: true })
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  token: string;

  @Column()
  platform: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Notification Service Implementation

```typescript
// apps/notification-service/src/services/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  Notification, NotificationType, NotificationChannel,
} from '../entities/notification.entity';
import { DeviceToken } from '../entities/device-token.entity';
import { PushNotificationService } from './push-notification.service';
import { EmailNotificationService } from './email-notification.service';
import { InAppNotificationService } from './in-app-notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
    private readonly pushService: PushNotificationService,
    private readonly emailService: EmailNotificationService,
    private readonly inAppService: InAppNotificationService,
    private readonly templateService: NotificationTemplateService,
    private readonly logger: AppLoggerService,
  ) {}

  async send(
    userId: string,
    type: NotificationType,
    channels: NotificationChannel[],
    data: Record<string, any>,
  ) {
    const template = this.templateService.getTemplate(type, data);

    const notification = this.notificationRepo.create({
      userId,
      type,
      title: template.title,
      body: template.body,
      imageUrl: template.imageUrl,
      actionUrl: template.actionUrl,
      data,
      channel: channels[0],
      sentAt: new Date(),
    });

    await this.notificationRepo.save(notification);

    for (const channel of channels) {
      switch (channel) {
        case NotificationChannel.PUSH:
          await this.sendPush(userId, notification);
          break;
        case NotificationChannel.EMAIL:
          await this.sendEmail(userId, notification);
          break;
        case NotificationChannel.IN_APP:
          await this.inAppService.create(notification);
          break;
      }
    }

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.notificationRepo.update(
      { id: notificationId, userId },
      { isRead: true, readAt: new Date() },
    );
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async registerDeviceToken(userId: string, token: string, platform: string) {
    const existing = await this.deviceTokenRepo.findOne({
      where: { userId, token },
    });

    if (!existing) {
      await this.deviceTokenRepo.save(
        this.deviceTokenRepo.create({ userId, token, platform }),
      );
    }
  }

  async removeDeviceToken(userId: string, token: string) {
    await this.deviceTokenRepo.delete({ userId, token });
  }

  private async sendPush(userId: string, notification: Notification) {
    const tokens = await this.deviceTokenRepo.find({ where: { userId } });
    if (tokens.length === 0) return;

    const tokenValues = tokens.map((t) => t.token);

    await this.pushService.send({
      tokens: tokenValues,
      title: notification.title,
      body: notification.body,
      imageUrl: notification.imageUrl,
      data: notification.data,
    });
  }

  private async sendEmail(userId: string, notification: Notification) {
    await this.emailService.send({
      userId,
      subject: notification.title,
      html: notification.body,
    });
  }

  @EventPattern('notification.match')
  async handleMatchNotification(
    @Payload() data: {
      userId: string;
      targetUserId: string;
      matchId: string;
    },
  ) {
    await this.send(
      data.userId,
      NotificationType.MATCH,
      [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      { matchId: data.matchId, targetUserId: data.targetUserId },
    );
    await this.send(
      data.targetUserId,
      NotificationType.MATCH,
      [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      { matchId: data.matchId, targetUserId: data.userId },
    );
  }

  @EventPattern('notification.new-message')
  async handleMessageNotification(
    @Payload() data: {
      userId: string;
      senderId: string;
      conversationId: string;
      messagePreview: string;
    },
  ) {
    await this.send(
      data.userId,
      NotificationType.MESSAGE,
      [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      {
        senderId: data.senderId,
        conversationId: data.conversationId,
        messagePreview: data.messagePreview,
      },
    );
  }

  @EventPattern('notification.subscription.activated')
  async handleSubscriptionActivated(
    @Payload() data: { userId: string; plan: string },
  ) {
    await this.send(
      data.userId,
      NotificationType.SUBSCRIPTION,
      [NotificationChannel.IN_APP],
      { plan: data.plan, action: 'activated' },
    );
  }
}
`

---
### 3.11 Search Service

Handles advanced search, filtering, autocomplete, and Elasticsearch index management.

#### Folder Structure

`
apps/search-service/
├── src/
│   ├── search-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   └── search.controller.ts
│   ├── services/
│   │   ├── search.service.ts
│   │   ├── elasticsearch.service.ts
│   │   ├── index-sync.service.ts
│   │   └── autocomplete.service.ts
│   ├── dto/
│   │   ├── search.dto.ts
│   │   └── autocomplete.dto.ts
│   ├── event-handlers/
│   │   ├── profile-events.handler.ts
│   │   └── user-events.handler.ts
│   └── indices/
│       ├── profile.index.ts
│       └── user.index.ts
├── test/
└── tsconfig.app.json
`

#### Search Service Implementation

```typescript
// apps/search-service/src/services/search.service.ts
import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchDto } from '../dto/search.dto';
import { AutocompleteDto } from '../dto/autocomplete.dto';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly logger: AppLoggerService,
  ) {}

  async searchProfiles(userId: string, query: SearchDto) {
    const must: any[] = [
      { term: { isActive: true } },
      { bool: { must_not: [{ term: { userId } }] } },
    ];

    const filter: any[] = [];

    if (query.gender) {
      filter.push({ term: { gender: query.gender } });
    }

    if (query.minAge || query.maxAge) {
      const range: any = {};
      if (query.minAge) range.gte = query.minAge;
      if (query.maxAge) range.lte = query.maxAge;
      filter.push({ range: { age: range } });
    }

    if (query.interests?.length) {
      must.push({
        nested: {
          path: 'interests',
          query: {
            terms: { 'interests.name': query.interests },
          },
        },
      });
    }

    if (query.query) {
      must.push({
        multi_match: {
          query: query.query,
          fields: ['firstName^3', 'bio^2', 'jobTitle', 'school'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (query.latitude && query.longitude) {
      filter.push({
        geo_distance: {
          distance: (query.maxDistance || 50) + 'km',
          location: {
            lat: query.latitude,
            lon: query.longitude,
          },
        },
      });
    }

    const body = {
      query: {
        bool: {
          must,
          filter,
        },
      },
      highlight: {
        fields: {
          bio: {},
          firstName: {},
        },
      },
      from: ((query.page || 1) - 1) * (query.limit || 20),
      size: query.limit || 20,
    };

    const result = await this.elasticsearchService.search('profiles', body);

    return {
      data: result.hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
        highlights: hit.highlight,
      })),
      meta: {
        total: result.hits.total.value,
        page: query.page || 1,
        limit: query.limit || 20,
      },
    };
  }

  async autocomplete(query: AutocompleteDto) {
    const body = {
      suggest: {
        name_suggest: {
          prefix: query.q,
          completion: {
            field: 'firstName.suggest',
            fuzzy: { fuzziness: 'AUTO' },
            size: 10,
          },
        },
      },
    };

    const result = await this.elasticsearchService.search('profiles', body);

    return (
      result.suggest?.name_suggest[0]?.options?.map((option: any) => ({
        text: option.text,
        score: option._score,
      })) || []
    );
  }

  async indexProfile(profile: any) {
    await this.elasticsearchService.index('profiles', profile.id, {
      ...profile,
      location:
        profile.latitude && profile.longitude
          ? { lat: profile.latitude, lon: profile.longitude }
          : null,
      age: profile.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(profile.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : null,
    });
  }

  async removeProfile(profileId: string) {
    await this.elasticsearchService.delete('profiles', profileId);
  }

  async reindexAll() {
    this.logger.log('Starting full reindex', 'SearchService');
  }

  @EventPattern('profile.created')
  async handleProfileCreated(@Payload() data: any) {
    await this.indexProfile(data);
  }

  @EventPattern('profile.updated')
  async handleProfileUpdated(@Payload() data: any) {
    await this.indexProfile(data);
  }

  @EventPattern('profile.deleted')
  async handleProfileDeleted(@Payload() data: { profileId: string }) {
    await this.removeProfile(data.profileId);
  }

  @EventPattern('user.deactivated')
  async handleUserDeactivated(@Payload() data: { userId: string }) {
    await this.elasticsearchService.updateByQuery('profiles', {
      query: { term: { userId: data.userId } },
      script: { source: 'ctx._source.isActive = false' },
    });
  }
}
`

---

### 3.12 Admin Service

Handles admin dashboards, user management, content moderation, analytics, and system configuration.

#### Folder Structure

`
apps/admin-service/
├── src/
│   ├── admin-service.module.ts
│   ├── main.ts
│   ├── controllers/
│   │   ├── admin.controller.ts
│   │   ├── user-management.controller.ts
│   │   ├── moderation.controller.ts
│   │   └── analytics.controller.ts
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── user-management.service.ts
│   │   ├── moderation.service.ts
│   │   ├── analytics.service.ts
│   │   └── report.service.ts
│   ├── entities/
│   │   ├── admin-user.entity.ts
│   │   ├── audit-log.entity.ts
│   │   ├── moderation-queue.entity.ts
│   │   └── system-config.entity.ts
│   ├── dto/
│   │   ├── admin-login.dto.ts
│   │   ├── user-management.dto.ts
│   │   ├── moderation.dto.ts
│   │   └── analytics-query.dto.ts
│   ├── guards/
│   │   └── admin-auth.guard.ts
│   ├── event-handlers/
│   │   └── moderation-events.handler.ts
│   └── decorators/
│       └── audit-log.decorator.ts
├── test/
└── tsconfig.app.json
`

#### Entity: Admin User

```typescript
// apps/admin-service/src/entities/admin-user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdminRole {
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: AdminRole, default: AdminRole.MODERATOR })
  role: AdminRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`

#### Entity: Audit Log

```typescript
// apps/admin-service/src/entities/audit-log.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['adminId', 'createdAt'])
@Index(['action'])
@Index(['targetType', 'targetId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  adminId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetType: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
`

#### Admin Service Implementation

```typescript
// apps/admin-service/src/services/admin.service.ts
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { EventPattern, Payload, ClientProxy, Inject } from '@nestjs/microservices';
import { AdminUser, AdminRole } from '../entities/admin-user.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { SystemConfig } from '../entities/system-config.entity';
import { PasswordService } from './password.service';
import { AppLoggerService } from '@app/logger';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    private readonly passwordService: PasswordService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MATCHING_SERVICE') private readonly matchingClient: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin || !admin.isActive) {
      throw new RpcException(new UnauthorizedException('Invalid credentials'));
    }

    const isValid = await this.passwordService.compare(
      password,
      admin.passwordHash,
    );
    if (!isValid) {
      throw new RpcException(new UnauthorizedException('Invalid credentials'));
    }

    await this.adminRepo.update(admin.id, { lastLoginAt: new Date() });

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      permissions: admin.permissions,
    };
  }

  async suspendUser(adminId: string, userId: string, reason: string) {
    await this.logAction(adminId, 'suspend_user', 'user', userId, { reason });
    this.userClient.emit('user.suspended', { userId, reason });
    return { success: true };
  }

  async deactivateUser(adminId: string, userId: string, reason: string) {
    await this.logAction(adminId, 'deactivate_user', 'user', userId, { reason });
    this.userClient.emit('user.deactivated', { userId, reason });
    return { success: true };
  }

  async reactivateUser(adminId: string, userId: string) {
    await this.logAction(adminId, 'reactivate_user', 'user', userId);
    this.userClient.emit('user.reactivated', { userId });
    return { success: true };
  }

  async getSystemConfig(key: string) {
    const config = await this.configRepo.findOne({ where: { key } });
    return config?.value;
  }

  async setSystemConfig(
    adminId: string,
    key: string,
    value: any,
    description?: string,
  ) {
    let config = await this.configRepo.findOne({ where: { key } });

    if (config) {
      const oldValue = config.value;
      config.value = value;
      if (description) config.description = description;
      await this.configRepo.save(config);
      await this.logAction(adminId, 'update_config', 'config', key, {
        oldValue,
        newValue: value,
      });
    } else {
      config = this.configRepo.create({ key, value, description });
      await this.configRepo.save(config);
      await this.logAction(adminId, 'create_config', 'config', key, { value });
    }

    return config;
  }

  async getAuditLogs(page = 1, limit = 50) {
    const [logs, total] = await this.auditLogRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDashboardStats() {
    const totalUsers = await this.userClient
      .send('user.count', {})
      .toPromise();
    const activeMatches = await this.matchingClient
      .send('matching.count-active', {})
      .toPromise();

    return {
      totalUsers: totalUsers || 0,
      activeMatches: activeMatches || 0,
      timestamp: new Date().toISOString(),
    };
  }

  private async logAction(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    changes?: any,
  ) {
    const log = this.auditLogRepo.create({
      adminId,
      action,
      targetType,
      targetId,
      after: changes,
    });
    await this.auditLogRepo.save(log);
  }

  @EventPattern('moderation.report.received')
  async handleReportReceived(
    @Payload() data: {
      reportId: string;
      reportedUserId: string;
      reason: string;
    },
  ) {
    this.logger.log('Report received: ' + data.reportId, 'AdminService');
  }

  @EventPattern('moderation.content.flagged')
  async handleContentFlagged(
    @Payload() data: { mediaId: string; userId: string; reason: string },
  ) {
    this.logger.log('Content flagged: ' + data.mediaId, 'AdminService');
  }
}
`

---
## 4. Shared Libraries

### 4.1 Common Library (@app/common)

`
libs/common/
├── src/
│   ├── index.ts
│   ├── dto/
│   │   ├── auth/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   ├── reset-password.dto.ts
│   │   │   └── verify-email.dto.ts
│   │   ├── matching/
│   │   │   ├── swipe.dto.ts
│   │   │   ├── get-feed.dto.ts
│   │   │   └── get-matches.dto.ts
│   │   ├── chat/
│   │   │   ├── send-message.dto.ts
│   │   │   └── get-conversations.dto.ts
│   │   └── index.ts
│   ├── interfaces/
│   │   ├── pagination.interface.ts
│   │   ├── api-response.interface.ts
│   │   └── event-payload.interface.ts
│   ├── constants/
│   │   ├── events.constant.ts
│   │   ├── queues.constant.ts
│   │   └── patterns.constant.ts
│   ├── utils/
│   │   ├── hash.util.ts
│   │   ├── date.util.ts
│   │   └── geo.util.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       ├── public.decorator.ts
│       └── roles.decorator.ts
├── tsconfig.lib.json
└── package.json
`

#### Key DTOs with Validation

```typescript
// libs/common/src/dto/matching/swipe.dto.ts
import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { SwipeAction } from '../../constants/events.constant';

export class SwipeDto {
  @IsUUID()
  targetUserId: string;

  @IsEnum(SwipeAction)
  action: SwipeAction;
}
`

```typescript
// libs/common/src/dto/matching/get-feed.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFeedDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  maxDistance?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(100)
  minAge?: number = 18;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(100)
  maxAge?: number = 50;

  @IsOptional()
  @IsEnum(['male', 'female', 'non_binary'])
  gender?: string;
}
`

```typescript
// libs/common/src/dto/chat/send-message.dto.ts
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  GIF = 'gif',
  VOICE = 'voice',
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}
`

#### Constants: Event Patterns

```typescript
// libs/common/src/constants/events.constant.ts
export const AUTH_EVENTS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',
  LOGOUT: 'auth.logout',
  GET_ME: 'auth.get-me',
  FORGOT_PASSWORD: 'auth.forgot-password',
  RESET_PASSWORD: 'auth.reset-password',
  VERIFY_EMAIL: 'auth.verify-email',
} as const;

export const MATCHING_EVENTS = {
  GET_FEED: 'matching.get-feed',
  SWIPE: 'matching.swipe',
  GET_MATCHES: 'matching.get-matches',
  GET_MATCH: 'matching.get-match',
  SUPER_LIKE: 'matching.super-like',
  ACTIVATE_BOOST: 'matching.activate-boost',
} as const;

export const CHAT_EVENTS = {
  SEND_MESSAGE: 'chat.send-message',
  GET_CONVERSATIONS: 'chat.get-conversations',
  GET_MESSAGES: 'chat.get-messages',
} as const;

export const USER_EVENTS = {
  UPDATED: 'user.updated',
  DEACTIVATED: 'user.deactivated',
  SUSPENDED: 'user.suspended',
  BLOCKED: 'user.blocked',
} as const;

export const PROFILE_EVENTS = {
  CREATED: 'profile.created',
  UPDATED: 'profile.updated',
  DELETED: 'profile.deleted',
} as const;

export const PAYMENT_EVENTS = {
  SUBSCRIPTION_ACTIVATED: 'payment.subscription.activated',
  SUBSCRIPTION_CANCELLED: 'payment.subscription.cancelled',
  BOOST_PURCHASED: 'payment.boost.purchased',
} as const;

export const NOTIFICATION_EVENTS = {
  MATCH: 'notification.match',
  NEW_MESSAGE: 'notification.new-message',
  SUBSCRIPTION_ACTIVATED: 'notification.subscription.activated',
} as const;
`

#### Decorators

```typescript
// libs/common/src/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
`

```typescript
// libs/common/src/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
`

```typescript
// libs/common/src/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
`

---

### 4.2 Auth Library (@app/auth)

`
libs/auth/
├── src/
│   ├── index.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttle.guard.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── interceptors/
│   │   └── auth-context.interceptor.ts
│   └── auth.module.ts
├── tsconfig.lib.json
└── package.json
`

#### JWT Auth Guard

```typescript
// libs/auth/src/guards/jwt-auth.guard.ts
import {
  Injectable, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
`

#### Roles Guard

```typescript
// libs/auth/src/guards/roles.guard.ts
import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
`

---

### 4.3 Database Library (@app/database)

`
libs/database/
├── src/
│   ├── index.ts
│   ├── database.module.ts
│   ├── data-source.ts
│   ├── typeorm-config.service.ts
│   ├── migrations/
│   │   └── index.ts
│   └── seeds/
│       ├── interest.seed.ts
│       └── admin.seed.ts
├── tsconfig.lib.json
└── package.json
`

#### Database Module

```typescript
// libs/database/src/database.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmConfigService } from './typeorm-config.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
`

#### TypeORM Config Service

```typescript
// libs/database/src/typeorm-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'connecta'),
      password: this.configService.get('DB_PASSWORD', 'connecta_secret'),
      database: this.configService.get('DB_NAME', 'connecta'),
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get('DB_SYNC', false),
      logging: this.configService.get('DB_LOGGING', false),
      ssl: this.configService.get('DB_SSL', false)
        ? { rejectUnauthorized: false }
        : false,
      poolSize: this.configService.get('DB_POOL_SIZE', 20),
      maxQueryExecutionTime: this.configService.get('DB_QUERY_TIMEOUT', 10000),
    };
  }
}
`

#### Data Source for Migrations

```typescript
// libs/database/src/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'connecta',
  password: process.env.DB_PASSWORD || 'connecta_secret',
  database: process.env.DB_NAME || 'connecta',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
`

---

### 4.4 Config Library (@app/config)

`
libs/config/
├── src/
│   ├── index.ts
│   ├── config.module.ts
│   ├── config.service.ts
│   └── configurations/
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── redis.config.ts
│       ├── nats.config.ts
│       ├── jwt.config.ts
│       ├── s3.config.ts
│       └── elasticsearch.config.ts
├── tsconfig.lib.json
└── package.json
`

#### Config Module

```typescript
// libs/config/src/config.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import appConfig from './configurations/app.config';
import databaseConfig from './configurations/database.config';
import redisConfig from './configurations/redis.config';
import natsConfig from './configurations/nats.config';
import jwtConfig from './configurations/jwt.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, natsConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService, ConfigModule],
})
export class AppConfigModule {}
`

#### Config Service

```typescript
// libs/config/src/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get app() {
    return {
      port: this.configService.get('app.port', 3000),
      environment: this.configService.get('app.environment', 'development'),
      corsOrigins: this.configService.get('app.corsOrigins', []),
    };
  }

  get database() {
    return {
      host: this.configService.get('database.host', 'localhost'),
      port: this.configService.get('database.port', 5432),
      username: this.configService.get('database.username', 'connecta'),
      password: this.configService.get('database.password', ''),
      name: this.configService.get('database.name', 'connecta'),
    };
  }

  get redis() {
    return {
      host: this.configService.get('redis.host', 'localhost'),
      port: this.configService.get('redis.port', 6379),
      password: this.configService.get('redis.password', ''),
    };
  }

  get nats() {
    return {
      url: this.configService.get('nats.url', 'nats://localhost:4222'),
    };
  }

  get jwt() {
    return {
      accessSecret: this.configService.get('jwt.accessSecret', ''),
      refreshSecret: this.configService.get('jwt.refreshSecret', ''),
      accessExpiry: this.configService.get('jwt.accessExpiry', '15m'),
      refreshExpiry: this.configService.get('jwt.refreshExpiry', '7d'),
    };
  }
}
`

---

### 4.5 Logger Library (@app/logger)

`
libs/logger/
├── src/
│   ├── index.ts
│   ├── logger.module.ts
│   ├── logger.service.ts
│   ├── logger.interceptor.ts
│   └── transports/
│       ├── console.transport.ts
│       ├── file.transport.ts
│       └── elasticsearch.transport.ts
├── tsconfig.lib.json
└── package.json
`

#### Logger Service

```typescript
// libs/logger/src/logger.service.ts
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context: string;

  constructor(private readonly configService: ConfigService) {
    this.logger = winston.createLogger({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'connecta' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, {
      context: context || this.context,
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      trace,
      context: context || this.context,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, {
      context: context || this.context,
      timestamp: new Date().toISOString(),
    });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, {
      context: context || this.context,
      timestamp: new Date().toISOString(),
    });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, {
      context: context || this.context,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 5. Inter-Service Communication

### 5.1 NATS Event Bus

All cross-service communication uses NATS JetStream for reliable, ordered event delivery.

```typescript
// libs/common/src/nats-client.ts
import { Client, NatsConnection, StringCodec } from 'nats';

export class NatsClient {
  private connection: NatsConnection;
  private codec = StringCodec();

  async connect(): Promise<void> {
    this.connection = await Client.connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222',
      reconnect: true,
      maxReconnectAttempts: 10,
    });
  }

  async publish(subject: string, data: unknown): Promise<void> {
    this.connection.publish(subject, this.codec.encode(JSON.stringify(data)));
  }

  async subscribe(
    subject: string,
    handler: (data: unknown) => Promise<void>
  ): Promise<void> {
    const sub = this.connection.subscribe(subject);
    for await (const msg of sub) {
      const data = JSON.parse(this.codec.decode(msg.data));
      await handler(data);
      msg.ack();
    }
  }
}
```

### 5.2 Event Catalog

| Subject | Publisher | Subscribers | Payload |
|---|---|---|---|
| `user.registered` | Auth Service | Notification, Analytics | userId, email |
| `user.profile.updated` | User Service | Matching, Search | userId, changes |
| `match.created` | Matching Service | Notification, Chat | matchId, userIds |
| `message.sent` | Chat Service | Notification, Moderation | messageId, conversationId |
| `payment.completed` | Payment Service | Notification, Subscription | transactionId, userId |
| `report.submitted` | User Service | Admin, Moderation | reportId, reportedUserId |
| `subscription.activated` | Payment Service | Notification, User | subscriptionId, planId |
| `call.ended` | Call Service | Analytics | callId, duration, quality |

---

## 6. Database Connection Management

### 6.1 TypeORM Configuration

```typescript
// libs/database/src/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA || 'public',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
      poolSize: 20,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    }),
  ],
})
export class DatabaseModule {}
```

---

## 7. Validation & Guards

### 7.1 Global Validation Pipe

```typescript
// main.ts (each service)
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  })
);
```

### 7.2 JWT Auth Guard

```typescript
// libs/auth/src/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// libs/auth/src/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### 7.3 Service-Specific Guards

```typescript
// Profile ownership guard
@Injectable()
export class ProfileOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const targetId = request.params.id || request.body.userId;
    return userId === targetId;
  }
}
```

---

## 8. Rate Limiting

```typescript
// libs/common/src/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(req.user?.id || req.ip);
  }
}

// Usage in controller
@UseGuards(RateLimitGuard)
@Throttle(60, 60) // 60 requests per 60 seconds
@Controller('users')
export class UsersController { ... }
```

---

## 9. Health Checks

```typescript
// libs/common/src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@nestjs/terminus';

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogLimit: 3,
    }),
  ],
  providers: [
    TypeOrmHealthIndicator,
    RedisHealthIndicator,
  ],
})
export class HealthModule {}

// health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.typeOrm.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.typeOrm.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

---

## 10. Graceful Shutdown

```typescript
// main.ts (each service)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Service running on port ${port}`);
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});
```

---

*This document is part of the Connecta Software Design Document (SDD) package.*
