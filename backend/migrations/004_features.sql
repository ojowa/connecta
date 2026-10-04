-- Migration 004: Features
-- Creates boosts, moments, moment_views, profile_prompts, user_prompts, photo_likes tables
-- Adds incognitoMode to users, passport fields to user_preferences

-- 1. boosts table
CREATE TABLE IF NOT EXISTS boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "durationMinutes" INT DEFAULT 30,
    "expiresAt" TIMESTAMP NULL,
    "isActive" BOOLEAN DEFAULT true,
    "viewsGained" INT DEFAULT 0,
    "likesGained" INT DEFAULT 0,
    "activeAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boosts_user_active ON boosts ("userId", "activeAt");

-- 2. moments table
CREATE TABLE IF NOT EXISTS moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "mediaUrl" VARCHAR NULL,
    "caption" VARCHAR NULL,
    "mediaType" VARCHAR NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "viewCount" INT DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moments_user_expires ON moments ("userId", "expiresAt");

-- 3. moment_views table
CREATE TABLE IF NOT EXISTS moment_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "momentId" UUID NOT NULL,
    "viewerId" VARCHAR NOT NULL,
    "viewedAt" TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_moment_views_moment_viewer ON moment_views ("momentId", "viewerId");

-- 4. profile_prompts table
CREATE TABLE IF NOT EXISTS profile_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "question" VARCHAR NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INT DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- 5. user_prompts table
CREATE TABLE IF NOT EXISTS user_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "question" VARCHAR NOT NULL,
    "answer" VARCHAR NOT NULL,
    "sortOrder" INT DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_prompts_user_question ON user_prompts ("userId", "question");

-- 6. photo_likes table
CREATE TABLE IF NOT EXISTS photo_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "photoId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_likes_user_photo ON photo_likes ("userId", "photoId");

-- 7. Add incognitoMode to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "incognitoMode" BOOLEAN DEFAULT false;

-- 8-10. Add passport fields to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS "passportLatitude" DECIMAL(10,7);
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS "passportLongitude" DECIMAL(10,7);
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS "passportEnabled" BOOLEAN DEFAULT false;
