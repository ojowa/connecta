import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1724000000000 implements MigrationInterface {
  name = 'InitialSchema1724000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enums = [
      { name: 'users_role_enum', values: "'user', 'premium', 'admin', 'super_admin'" },
      { name: 'users_status_enum', values: "'active', 'suspended', 'banned', 'deactivated', 'pending_verification'" },
    ];
    for (const e of enums) {
      const exists = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = $1`, [e.name]);
      if (!exists.length) await queryRunner.query(`CREATE TYPE "public"."${e.name}" AS ENUM(${e.values})`);
    }

    const tables: [string, string][] = [
      ['users', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "phone" varchar,
        "passwordHash" varchar NOT NULL,
        "fullName" varchar,
        "dateOfBirth" date,
        "gender" varchar,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "phoneVerified" boolean NOT NULL DEFAULT false,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending_verification',
        "lastLoginAt" timestamp, "lastActiveAt" timestamp,
        "loginAttempts" integer NOT NULL DEFAULT 0,
        "lockUntil" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['sessions', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "deviceId" varchar NOT NULL,
        "deviceName" varchar, "deviceType" varchar, "ipAddress" varchar, "userAgent" varchar,
        "refreshToken" varchar NOT NULL, "expiresAt" timestamp NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['otp_codes', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar, "phone" varchar, "email" varchar,
        "code" varchar NOT NULL, "purpose" varchar NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0, "maxAttempts" integer NOT NULL DEFAULT 3,
        "expiresAt" timestamp NOT NULL, "verifiedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['profiles', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar,
        "bio" varchar, "dateOfBirth" date, "gender" varchar,
        "jobTitle" varchar, "company" varchar, "school" varchar,
        "latitude" decimal(10,7), "longitude" decimal(10,7),
        "city" varchar, "country" varchar, "relationshipGoal" varchar,
        "verified" boolean NOT NULL DEFAULT false, "verifiedAt" timestamp,
        "completionPercentage" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true, "prompts" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['photos', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "profileId" varchar NOT NULL, "url" varchar NOT NULL, "thumbnailUrl" varchar,
        "order" integer NOT NULL DEFAULT 0, "isPrimary" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['interests', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL, "category" varchar, "icon" varchar,
        "isActive" boolean NOT NULL DEFAULT true
      `],
      ['profile_interests', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "profileId" varchar NOT NULL, "interestId" varchar NOT NULL
      `],
      ['user_preferences', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL,
        "ageMin" integer NOT NULL DEFAULT 18, "ageMax" integer NOT NULL DEFAULT 50,
        "maxDistanceKm" integer NOT NULL DEFAULT 50, "showMe" varchar NOT NULL DEFAULT 'opposite',
        "showVerifiedOnly" boolean NOT NULL DEFAULT false,
        "showProfilesWithPhotosOnly" boolean NOT NULL DEFAULT true,
        "globalDiscovery" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['likes', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "likedUserId" varchar NOT NULL,
        "isSuperLike" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['passes', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "passedUserId" varchar NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['matches', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user1Id" varchar NOT NULL, "user2Id" varchar NOT NULL, "conversationId" varchar,
        "matchedAt" timestamp NOT NULL DEFAULT now(),
        "isActive" boolean NOT NULL DEFAULT true, "matchedVia" varchar NOT NULL DEFAULT 'like'
      `],
      ['daily_likes', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL,
        "date" date NOT NULL DEFAULT CURRENT_DATE,
        "likesGiven" integer NOT NULL DEFAULT 0, "superLikesGiven" integer NOT NULL DEFAULT 0
      `],
      ['conversations', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "type" varchar NOT NULL DEFAULT 'direct',
        "lastMessageId" varchar, "lastMessageAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['conversation_participants', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversationId" varchar NOT NULL, "userId" varchar NOT NULL,
        "lastReadAt" timestamp, "unreadCount" integer NOT NULL DEFAULT 0,
        "isMuted" boolean NOT NULL DEFAULT false,
        "joinedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['messages', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversationId" varchar NOT NULL, "senderId" varchar NOT NULL,
        "type" varchar NOT NULL DEFAULT 'text', "content" varchar,
        "mediaUrl" varchar, "encryptedContent" varchar, "replyToId" varchar,
        "status" varchar NOT NULL DEFAULT 'sent',
        "isDeleted" boolean NOT NULL DEFAULT false, "deletedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['message_reactions', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "messageId" varchar NOT NULL, "userId" varchar NOT NULL, "emoji" varchar NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['read_receipts', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "messageId" varchar NOT NULL, "userId" varchar NOT NULL,
        "readAt" timestamp NOT NULL DEFAULT NOW()
      `],
      ['blocks', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "blockerId" varchar NOT NULL, "blockedId" varchar NOT NULL, "reason" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['reports', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "reporterId" varchar NOT NULL, "reportedId" varchar NOT NULL,
        "reason" varchar NOT NULL, "description" varchar, "evidenceUrls" text[],
        "status" varchar NOT NULL DEFAULT 'pending',
        "reviewedBy" varchar, "actionTaken" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['plans', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL, "displayName" varchar NOT NULL, "description" varchar,
        "priceMonthly" decimal(10,2) NOT NULL, "priceYearly" decimal(10,2),
        "currency" varchar NOT NULL DEFAULT 'NGN', "features" jsonb NOT NULL,
        "dailyLikes" integer, "dailySuperLikes" integer,
        "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['subscriptions', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "planId" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'active', "billingPeriod" varchar NOT NULL DEFAULT 'monthly',
        "startedAt" timestamp NOT NULL, "currentPeriodStart" timestamp,
        "currentPeriodEnd" timestamp, "cancelledAt" timestamp,
        "autoRenew" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['transactions', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "subscriptionId" varchar, "type" varchar NOT NULL,
        "amount" decimal(10,2) NOT NULL, "currency" varchar NOT NULL DEFAULT 'NGN',
        "status" varchar NOT NULL DEFAULT 'pending',
        "paymentMethod" varchar, "gateway" varchar, "reference" varchar, "gatewayRef" varchar,
        "gatewayResponse" jsonb, "metadata" jsonb, "completedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['notifications', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "type" varchar NOT NULL,
        "title" varchar NOT NULL, "body" varchar NOT NULL,
        "data" jsonb, "channel" varchar,
        "status" varchar NOT NULL DEFAULT 'pending',
        "readAt" timestamp, "sentAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['notification_preferences', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL,
        "matchNotify" boolean NOT NULL DEFAULT true, "messageNotify" boolean NOT NULL DEFAULT true,
        "likeNotify" boolean NOT NULL DEFAULT true, "superLikeNotify" boolean NOT NULL DEFAULT true,
        "callNotify" boolean NOT NULL DEFAULT true, "subscriptionNotify" boolean NOT NULL DEFAULT true,
        "marketingNotify" boolean NOT NULL DEFAULT false,
        "quietHoursStart" time, "quietHoursEnd" time,
        "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['call_sessions', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "callerId" varchar NOT NULL, "calleeId" varchar NOT NULL, "callType" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'ringing',
        "connectedAt" timestamp, "endedAt" timestamp, "duration" integer, "endReason" varchar,
        "startedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['media', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "url" varchar NOT NULL, "thumbnailUrl" varchar,
        "mimeType" varchar NOT NULL, "sizeBytes" integer NOT NULL,
        "purpose" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'active',
        "metadata" jsonb, "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['pre_key_bundles', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "deviceId" integer NOT NULL DEFAULT 1,
        "keyType" varchar NOT NULL, "keyId" integer, "publicKey" varchar NOT NULL,
        "signature" varchar, "used" boolean NOT NULL DEFAULT false,
        "uploadedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['biometric_credentials', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar NOT NULL, "deviceId" varchar NOT NULL, "biometricType" varchar NOT NULL,
        "publicKey" text NOT NULL, "credentialId" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['admin_users', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "name" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'moderator', "isActive" boolean NOT NULL DEFAULT true,
        "tfaEnabled" boolean NOT NULL DEFAULT false, "tfaSecret" varchar,
        "lastLoginAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
      ['admin_sessions', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "adminId" varchar NOT NULL, "tokenHash" varchar NOT NULL,
        "ipAddress" varchar, "userAgent" varchar, "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['audit_log', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "adminId" varchar NOT NULL, "action" varchar NOT NULL,
        "targetType" varchar, "targetId" varchar, "details" jsonb, "ipAddress" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now()
      `],
      ['system_settings', `
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "key" varchar NOT NULL, "value" jsonb NOT NULL,
        "description" varchar, "updatedBy" varchar,
        "updatedAt" timestamp NOT NULL DEFAULT now()
      `],
    ];

    for (const [name, cols] of tables) {
      const exists = await queryRunner.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [name]);
      if (!exists.length) await queryRunner.query(`CREATE TABLE "${name}" (${cols})`);
    }

    const indexes: [string, string, string][] = [
      ['IDX_users_email', 'users', '"email"'],
      ['IDX_users_phone', 'users', '"phone" WHERE "phone" IS NOT NULL'],
      ['IDX_sessions_user_device', 'sessions', '"userId", "deviceId"'],
      ['IDX_profiles_userId', 'profiles', '"userId"'],
      ['IDX_photos_profile_order', 'photos', '"profileId", "order"'],
      ['IDX_likes_user_liked', 'likes', '"userId", "likedUserId"'],
      ['IDX_passes_user_passed', 'passes', '"userId", "passedUserId"'],
      ['IDX_matches_users', 'matches', '"user1Id", "user2Id"'],
      ['IDX_daily_likes_user_date', 'daily_likes', '"userId", "date"'],
      ['IDX_conv_participants', 'conversation_participants', '"conversationId", "userId"'],
      ['IDX_messages_conv_created', 'messages', '"conversationId", "createdAt"'],
      ['IDX_msg_reactions', 'message_reactions', '"messageId", "userId", "emoji"'],
      ['IDX_read_receipts', 'read_receipts', '"messageId", "userId"'],
      ['IDX_blocks_users', 'blocks', '"blockerId", "blockedId"'],
      ['IDX_prekey_user_device', 'pre_key_bundles', '"userId", "deviceId"'],
      ['IDX_prekey_user_type', 'pre_key_bundles', '"userId", "keyType"'],
      ['IDX_biometric_user_cred', 'biometric_credentials', '"userId", "credentialId"'],
    ];

    for (const [idxName, table, cols] of indexes) {
      const exists = await queryRunner.query(`SELECT 1 FROM pg_indexes WHERE indexname = $1`, [idxName.toLowerCase()]);
      if (!exists.length) {
        const unique = idxName.includes('uniq') || cols.includes('WHERE') ? 'UNIQUE ' : '';
        await queryRunner.query(`CREATE ${unique}INDEX "${idxName}" ON "${table}" (${cols})`);
      }
    }

    const fks: [string, string, string][] = [
      ['FK_sessions_user', 'sessions', '"userId" REFERENCES "users"("id") ON DELETE CASCADE'],
      ['FK_otp_user', 'otp_codes', '"userId" REFERENCES "users"("id") ON DELETE CASCADE'],
      ['FK_photos_profile', 'photos', '"profileId" REFERENCES "profiles"("id") ON DELETE CASCADE'],
      ['FK_pi_profile', 'profile_interests', '"profileId" REFERENCES "profiles"("id") ON DELETE CASCADE'],
      ['FK_pi_interest', 'profile_interests', '"interestId" REFERENCES "interests"("id") ON DELETE CASCADE'],
      ['FK_cp_conversation', 'conversation_participants', '"conversationId" REFERENCES "conversations"("id") ON DELETE CASCADE'],
      ['FK_messages_conversation', 'messages', '"conversationId" REFERENCES "conversations"("id") ON DELETE CASCADE'],
      ['FK_sub_plan', 'subscriptions', '"planId" REFERENCES "plans"("id")'],
    ];

    for (const [fkName, table, def] of fks) {
      const exists = await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1`, [fkName]);
      if (!exists.length) await queryRunner.query(`ALTER TABLE "${table}" ADD CONSTRAINT "${fkName}" FOREIGN KEY (${def})`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'audit_log', 'admin_sessions', 'admin_users', 'biometric_credentials',
      'pre_key_bundles', 'media', 'call_sessions', 'notification_preferences',
      'notifications', 'transactions', 'subscriptions', 'plans', 'reports',
      'blocks', 'read_receipts', 'message_reactions', 'messages',
      'conversation_participants', 'conversations', 'daily_likes', 'matches',
      'passes', 'likes', 'user_preferences', 'profile_interests', 'interests',
      'photos', 'profiles', 'otp_codes', 'sessions', 'users', 'system_settings'
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
