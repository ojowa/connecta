import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissingEntityTables1756550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const statements = [
      'CREATE TABLE IF NOT EXISTS "verification_requests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "selfieUrl" character varying NOT NULL, "status" character varying NOT NULL DEFAULT \'pending\', "faceWidth" integer, "faceHeight" integer, "faceConfidence" numeric(5,4), "livenessScore" numeric(5,4), "imageWidth" integer, "imageHeight" integer, "fileSize" integer, "reviewedBy" character varying, "reviewedAt" TIMESTAMP, "rejectionReason" character varying, "faceLandmarks" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c5d405ea25e8abd5b0b096a4f6f" PRIMARY KEY ("id"))',
      'CREATE TABLE IF NOT EXISTS "user_prompts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "question" character varying NOT NULL, "answer" character varying NOT NULL, "sortOrder" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed13a8af6a75a1c058ed61e0f8d" PRIMARY KEY ("id"))',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_e67b986e777a9b14c4f9b79b0f" ON "user_prompts" ("userId", "question")',
      'CREATE TABLE IF NOT EXISTS "user_behaviors" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "targetUserId" character varying NOT NULL, "action" character varying NOT NULL, "viewDurationMs" integer, "targetLat" numeric(10,7), "targetLon" numeric(10,7), "targetAge" integer, "targetGender" character varying, "targetInterests" jsonb, "targetJobTitle" character varying, "targetSchool" character varying, "targetCity" character varying, "distanceKm" numeric(5,2), "compatibilityScore" numeric(5,2), "resultedInMatch" boolean NOT NULL DEFAULT false, "resultedInConversation" boolean NOT NULL DEFAULT false, "responseTimeMinutes" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c345f97744cae055a1777e02c4c" PRIMARY KEY ("id"))',
      'CREATE INDEX IF NOT EXISTS "IDX_894ae0aac978c08e19eb8ba86a" ON "user_behaviors" ("createdAt")',
      'CREATE INDEX IF NOT EXISTS "IDX_c83dff975da0e4c69711fb76a9" ON "user_behaviors" ("targetUserId")',
      'CREATE INDEX IF NOT EXISTS "IDX_59a8d280795634196c1e663df5" ON "user_behaviors" ("userId", "action")',
      'CREATE INDEX IF NOT EXISTS "IDX_fffe430d28b9f2c7fe2e46b7ac" ON "user_behaviors" ("userId", "targetUserId")',
      'CREATE TABLE IF NOT EXISTS "profile_views" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profileId" character varying NOT NULL, "viewerId" character varying NOT NULL, "viewedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d097089dc034d5c56a396ae2fd2" PRIMARY KEY ("id"))',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_6f26231ea2558415564e81e883" ON "profile_views" ("profileId", "viewerId")',
      'CREATE TABLE IF NOT EXISTS "profile_prompts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "question" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4a3c8019e68cc29d5f52845ebc" PRIMARY KEY ("id"))',
      'CREATE TABLE IF NOT EXISTS "photo_likes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "photoId" character varying NOT NULL, "profileId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_161e201ea3ee9741b7476b43489" PRIMARY KEY ("id"))',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_61b739c59ca2e01a7c5a16e138" ON "photo_likes" ("userId", "photoId")',
      'CREATE TABLE IF NOT EXISTS "photo_analytics" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "photoId" character varying NOT NULL, "userId" character varying NOT NULL, "totalViews" integer NOT NULL DEFAULT \'0\', "likesReceived" integer NOT NULL DEFAULT \'0\', "passesAfterView" integer NOT NULL DEFAULT \'0\', "conversionRate" numeric(5,4) NOT NULL DEFAULT \'0\', "superLikesReceived" integer NOT NULL DEFAULT \'0\', "avgViewDurationMs" numeric(5,2) NOT NULL DEFAULT \'0\', "order" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_01ef3734ddee47986ad42e93712" PRIMARY KEY ("id"))',
      'CREATE INDEX IF NOT EXISTS "IDX_eab0c4eb18e84ec36c422dd32e" ON "photo_analytics" ("userId")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_a518d1e8dc42b085b64cfd3511" ON "photo_analytics" ("photoId")',
      'CREATE TABLE IF NOT EXISTS "notification_deliveries" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "notificationId" character varying NOT NULL, "userId" character varying NOT NULL, "type" character varying NOT NULL, "title" character varying NOT NULL, "body" text NOT NULL, "channel" character varying, "platform" character varying, "status" character varying NOT NULL DEFAULT \'pending\', "delivered" boolean NOT NULL DEFAULT false, "opened" boolean NOT NULL DEFAULT false, "clicked" boolean NOT NULL DEFAULT false, "deliveredAt" TIMESTAMP, "openedAt" TIMESTAMP, "clickedAt" TIMESTAMP, "failureReason" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_81daeff81f237bd384f7cfc4a4c" PRIMARY KEY ("id"))',
      'CREATE INDEX IF NOT EXISTS "IDX_0209c4abff2bbf6cb909c90523" ON "notification_deliveries" ("createdAt")',
      'CREATE INDEX IF NOT EXISTS "IDX_e9c43497ac1f1a2eae1a22b242" ON "notification_deliveries" ("status")',
      'CREATE INDEX IF NOT EXISTS "IDX_b72d75cc97fecf5d7d08e02636" ON "notification_deliveries" ("userId")',
      'CREATE INDEX IF NOT EXISTS "IDX_480dc696b3c108f40b394d65fa" ON "notification_deliveries" ("notificationId")',
      'CREATE TABLE IF NOT EXISTS "moments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "mediaUrl" character varying, "caption" character varying, "mediaType" character varying, "expiresAt" TIMESTAMP NOT NULL, "viewCount" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_5e37a182a29676eb8aa410bec12" PRIMARY KEY ("id"))',
      'CREATE INDEX IF NOT EXISTS "IDX_fd2727d27a30aaa2ada60b9733" ON "moments" ("deletedAt")',
      'CREATE INDEX IF NOT EXISTS "IDX_6793ae76ddfa217c3d8681983c" ON "moments" ("userId", "expiresAt")',
      'CREATE TABLE IF NOT EXISTS "moment_views" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "momentId" character varying NOT NULL, "viewerId" character varying NOT NULL, "viewedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a5e3d0a0bca280cd9b0dbb35bda" PRIMARY KEY ("id"))',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_950e91a3ac973c3200699dcd14" ON "moment_views" ("momentId", "viewerId")',
      'CREATE TABLE IF NOT EXISTS "elo_scores" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "score" numeric(6,2) NOT NULL DEFAULT \'1200\', "totalLikesReceived" integer NOT NULL DEFAULT \'0\', "totalLikesGiven" integer NOT NULL DEFAULT \'0\', "totalMatches" integer NOT NULL DEFAULT \'0\', "totalConversations" integer NOT NULL DEFAULT \'0\', "responseRate" numeric(5,2) NOT NULL DEFAULT \'0\', "avgResponseTimeMinutes" integer NOT NULL DEFAULT \'0\', "attractivenessPercentile" numeric(5,2) NOT NULL DEFAULT \'0.5\', "profileViews" integer NOT NULL DEFAULT \'0\', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd1c7f6375557fd16a78bbe329d" PRIMARY KEY ("id"))',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_5d676064f2577e6bf9ed2cda87" ON "elo_scores" ("userId")',
      'CREATE TABLE IF NOT EXISTS "device_tokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" character varying NOT NULL, "token" character varying NOT NULL, "platform" character varying NOT NULL DEFAULT \'expo\', "device_id" character varying, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84700be257607cfb1f9dc2e52c3" PRIMARY KEY ("id"))',
      'CREATE TABLE IF NOT EXISTS "conversation_signals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "matchId" character varying NOT NULL, "messagesSent" integer NOT NULL DEFAULT \'0\', "messagesReceived" integer NOT NULL DEFAULT \'0\', "avgMessageLength" integer NOT NULL DEFAULT \'0\', "avgResponseTimeMinutes" integer NOT NULL DEFAULT \'0\', "responseRate" numeric(5,4) NOT NULL DEFAULT \'0\', "didMeet" boolean NOT NULL DEFAULT false, "conversationDurationHours" integer, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_fc29cb6fc076497eb92cd6c5e73" PRIMARY KEY ("id"))',
      'CREATE INDEX IF NOT EXISTS "IDX_16627ace6e81e18a775f22ccb4" ON "conversation_signals" ("matchId")',
      'CREATE INDEX IF NOT EXISTS "IDX_a666a761a2657ae28117fdc6b3" ON "conversation_signals" ("userId", "matchId")',
      'CREATE TABLE IF NOT EXISTS "boosts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "durationMinutes" integer NOT NULL DEFAULT \'30\', "expiresAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "viewsGained" integer NOT NULL DEFAULT \'0\', "likesGained" integer NOT NULL DEFAULT \'0\', "activeAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_225335d93bbce36b48152a26b48" PRIMARY KEY ("id"))',
      'CREATE INDEX IF NOT EXISTS "IDX_9cb0d14edb9c3be07b9226d2f7" ON "boosts" ("userId", "activeAt")',
    ];

    for (const sql of statements) {
      try {
        await queryRunner.query(sql);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!/already exists|already in use|duplicate/i.test(msg)) {
          throw e;
        }
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty: dropping entity tables would destroy data.
  }
}
