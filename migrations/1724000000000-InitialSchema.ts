import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1724000000000 implements MigrationInterface {
  name = 'InitialSchema1724000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'premium', 'admin', 'super_admin'); END IF; END $$`);
    await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_status_enum') THEN CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'banned', 'deactivated', 'pending_verification'); END IF; END $$`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "email" varchar NOT NULL, "phone" varchar, "passwordHash" varchar NOT NULL, "fullName" varchar, "dateOfBirth" date, "gender" varchar, "emailVerified" boolean NOT NULL DEFAULT false, "phoneVerified" boolean NOT NULL DEFAULT false, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending_verification', "lastLoginAt" timestamp, "lastActiveAt" timestamp, "loginAttempts" integer NOT NULL DEFAULT 0, "lockUntil" timestamp, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_phone" ON "users" ("phone") WHERE "phone" IS NOT NULL`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "sessions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "deviceId" varchar NOT NULL, "deviceName" varchar, "deviceType" varchar, "ipAddress" varchar, "userAgent" varchar, "refreshToken" varchar NOT NULL, "expiresAt" timestamp NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sessions_user_device" ON "sessions" ("userId", "deviceId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "otp_codes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid, "phone" varchar, "email" varchar, "code" varchar NOT NULL, "purpose" varchar NOT NULL, "attempts" integer NOT NULL DEFAULT 0, "maxAttempts" integer NOT NULL DEFAULT 3, "expiresAt" timestamp NOT NULL, "verifiedAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "profiles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar, "bio" varchar, "dateOfBirth" date, "gender" varchar, "jobTitle" varchar, "company" varchar, "school" varchar, "latitude" decimal(10,7), "longitude" decimal(10,7), "city" varchar, "country" varchar, "relationshipGoal" varchar, "verified" boolean NOT NULL DEFAULT false, "verifiedAt" timestamp, "completionPercentage" integer NOT NULL DEFAULT 0, "isActive" boolean NOT NULL DEFAULT true, "prompts" jsonb, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_profiles_userId" ON "profiles" ("userId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "photos" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "profileId" uuid NOT NULL, "url" varchar NOT NULL, "thumbnailUrl" varchar, "order" integer NOT NULL DEFAULT 0, "isPrimary" boolean NOT NULL DEFAULT false, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_photos_profile_order" ON "photos" ("profileId", "order")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "interests" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar NOT NULL, "category" varchar, "icon" varchar, "isActive" boolean NOT NULL DEFAULT true)`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "profile_interests" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "profileId" uuid NOT NULL, "interestId" uuid NOT NULL)`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "user_preferences" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "ageMin" integer NOT NULL DEFAULT 18, "ageMax" integer NOT NULL DEFAULT 50, "maxDistanceKm" integer NOT NULL DEFAULT 50, "showMe" varchar NOT NULL DEFAULT 'opposite', "showVerifiedOnly" boolean NOT NULL DEFAULT false, "showProfilesWithPhotosOnly" boolean NOT NULL DEFAULT true, "globalDiscovery" boolean NOT NULL DEFAULT false, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "likes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "likedUserId" uuid NOT NULL, "isSuperLike" boolean NOT NULL DEFAULT false, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_likes_user_liked" ON "likes" ("userId", "likedUserId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "passes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "passedUserId" uuid NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_passes_user_passed" ON "passes" ("userId", "passedUserId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "matches" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user1Id" uuid NOT NULL, "user2Id" uuid NOT NULL, "conversationId" uuid, "matchedAt" timestamp NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "matchedVia" varchar NOT NULL DEFAULT 'like')`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_matches_users" ON "matches" ("user1Id", "user2Id")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "daily_likes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "date" date NOT NULL DEFAULT CURRENT_DATE, "likesGiven" integer NOT NULL DEFAULT 0, "superLikesGiven" integer NOT NULL DEFAULT 0)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_daily_likes_user_date" ON "daily_likes" ("userId", "date")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "conversations" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "type" varchar NOT NULL DEFAULT 'direct', "lastMessageId" uuid, "lastMessageAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "conversation_participants" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "conversationId" uuid NOT NULL, "userId" uuid NOT NULL, "lastReadAt" timestamp, "unreadCount" integer NOT NULL DEFAULT 0, "isMuted" boolean NOT NULL DEFAULT false, "joinedAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_conv_participants" ON "conversation_participants" ("conversationId", "userId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "messages" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "conversationId" uuid NOT NULL, "senderId" uuid NOT NULL, "type" varchar NOT NULL DEFAULT 'text', "content" varchar, "mediaUrl" varchar, "encryptedContent" varchar, "replyToId" uuid, "status" varchar NOT NULL DEFAULT 'sent', "isDeleted" boolean NOT NULL DEFAULT false, "deletedAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_messages_conv_created" ON "messages" ("conversationId", "createdAt")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "message_reactions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "messageId" uuid NOT NULL, "userId" uuid NOT NULL, "emoji" varchar NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_msg_reactions" ON "message_reactions" ("messageId", "userId", "emoji")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "read_receipts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "messageId" uuid NOT NULL, "userId" uuid NOT NULL, "readAt" timestamp NOT NULL DEFAULT NOW())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_read_receipts" ON "read_receipts" ("messageId", "userId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "blocks" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "blockerId" uuid NOT NULL, "blockedId" uuid NOT NULL, "reason" varchar, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blocks_users" ON "blocks" ("blockerId", "blockedId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "reports" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "reporterId" uuid NOT NULL, "reportedId" uuid NOT NULL, "reason" varchar NOT NULL, "description" varchar, "evidenceUrls" text[], "status" varchar NOT NULL DEFAULT 'pending', "reviewedBy" uuid, "actionTaken" varchar, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "plans" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar NOT NULL, "displayName" varchar NOT NULL, "description" varchar, "priceMonthly" decimal(10,2) NOT NULL, "priceYearly" decimal(10,2), "currency" varchar NOT NULL DEFAULT 'NGN', "features" jsonb NOT NULL, "dailyLikes" integer, "dailySuperLikes" integer, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT 0, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "subscriptions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "planId" uuid NOT NULL, "status" varchar NOT NULL DEFAULT 'active', "billingPeriod" varchar NOT NULL DEFAULT 'monthly', "startedAt" timestamp NOT NULL, "currentPeriodStart" timestamp, "currentPeriodEnd" timestamp, "cancelledAt" timestamp, "autoRenew" boolean NOT NULL DEFAULT true, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "transactions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "subscriptionId" uuid, "type" varchar NOT NULL, "amount" decimal(10,2) NOT NULL, "currency" varchar NOT NULL DEFAULT 'NGN', "status" varchar NOT NULL DEFAULT 'pending', "paymentMethod" varchar, "gateway" varchar, "reference" varchar, "gatewayRef" varchar, "gatewayResponse" jsonb, "metadata" jsonb, "completedAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notifications" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "type" varchar NOT NULL, "title" varchar NOT NULL, "body" varchar NOT NULL, "data" jsonb, "channel" varchar, "status" varchar NOT NULL DEFAULT 'pending', "readAt" timestamp, "sentAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notification_preferences" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "matchNotify" boolean NOT NULL DEFAULT true, "messageNotify" boolean NOT NULL DEFAULT true, "likeNotify" boolean NOT NULL DEFAULT true, "superLikeNotify" boolean NOT NULL DEFAULT true, "callNotify" boolean NOT NULL DEFAULT true, "subscriptionNotify" boolean NOT NULL DEFAULT true, "marketingNotify" boolean NOT NULL DEFAULT false, "quietHoursStart" time, "quietHoursEnd" time, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "call_sessions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "callerId" uuid NOT NULL, "calleeId" uuid NOT NULL, "callType" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'ringing', "connectedAt" timestamp, "endedAt" timestamp, "duration" integer, "endReason" varchar, "startedAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "media" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "url" varchar NOT NULL, "thumbnailUrl" varchar, "mimeType" varchar NOT NULL, "sizeBytes" integer NOT NULL, "purpose" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'active', "metadata" jsonb, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "pre_key_bundles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "deviceId" integer NOT NULL DEFAULT 1, "keyType" varchar NOT NULL, "keyId" integer, "publicKey" varchar NOT NULL, "signature" varchar, "used" boolean NOT NULL DEFAULT false, "uploadedAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prekey_user_device" ON "pre_key_bundles" ("userId", "deviceId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prekey_user_type" ON "pre_key_bundles" ("userId", "keyType")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "biometric_credentials" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "deviceId" varchar NOT NULL, "biometricType" varchar NOT NULL, "publicKey" text NOT NULL, "credentialId" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" timestamp NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_biometric_user_cred" ON "biometric_credentials" ("userId", "credentialId")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "admin_users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "name" varchar NOT NULL, "role" varchar NOT NULL DEFAULT 'moderator', "isActive" boolean NOT NULL DEFAULT true, "tfaEnabled" boolean NOT NULL DEFAULT false, "tfaSecret" varchar, "lastLoginAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "admin_sessions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "adminId" uuid NOT NULL, "tokenHash" varchar NOT NULL, "ipAddress" varchar, "userAgent" varchar, "expiresAt" timestamp NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_log" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "adminId" uuid NOT NULL, "action" varchar NOT NULL, "targetType" varchar, "targetId" varchar, "details" jsonb, "ipAddress" varchar, "createdAt" timestamp NOT NULL DEFAULT now())`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "system_settings" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "key" varchar NOT NULL, "value" jsonb NOT NULL, "description" varchar, "updatedBy" uuid, "updatedAt" timestamp NOT NULL DEFAULT now())`);

    const fks: [string, string][] = [
      ['FK_sessions_user', 'ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE'],
      ['FK_otp_user', 'ALTER TABLE "otp_codes" ADD CONSTRAINT "FK_otp_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE'],
      ['FK_profiles_user', 'ALTER TABLE "profiles" ADD CONSTRAINT "FK_profiles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE'],
      ['FK_photos_profile', 'ALTER TABLE "photos" ADD CONSTRAINT "FK_photos_profile" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE'],
      ['FK_pi_profile', 'ALTER TABLE "profile_interests" ADD CONSTRAINT "FK_pi_profile" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE'],
      ['FK_pi_interest', 'ALTER TABLE "profile_interests" ADD CONSTRAINT "FK_pi_interest" FOREIGN KEY ("interestId") REFERENCES "interests"("id") ON DELETE CASCADE'],
      ['FK_cp_conversation', 'ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_cp_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE'],
      ['FK_messages_conversation', 'ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE'],
      ['FK_sub_plan', 'ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_sub_plan" FOREIGN KEY ("planId") REFERENCES "plans"("id")'],
    ];
    for (const [fkName, sql] of fks) {
      const exists = await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1`, [fkName]);
      if (!exists.length) await queryRunner.query(sql);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'audit_log', 'admin_sessions', 'admin_users', 'biometric_credentials',
      'pre_key_bundles', 'media', 'call_sessions', 'notification_preferences',
      'notifications', 'transactions', 'subscriptions', 'plans',
      'reports', 'blocks', 'read_receipts', 'message_reactions', 'messages',
      'conversation_participants', 'conversations', 'daily_likes', 'matches',
      'passes', 'likes', 'user_preferences', 'profile_interests',
      'interests', 'photos', 'profiles', 'otp_codes', 'sessions', 'users', 'system_settings'
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}