CREATE TABLE IF NOT EXISTS user_behaviors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "targetUserId" VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    "viewDurationMs" INT NULL,
    "targetLat" DECIMAL(10, 7) NULL,
    "targetLon" DECIMAL(10, 7) NULL,
    "targetAge" INT NULL,
    "targetGender" VARCHAR NULL,
    "targetInterests" JSONB NULL,
    "targetJobTitle" VARCHAR NULL,
    "targetSchool" VARCHAR NULL,
    "targetCity" VARCHAR NULL,
    "distanceKm" DECIMAL(5, 2) NULL,
    "compatibilityScore" DECIMAL(5, 2) NULL,
    "resultedInMatch" BOOLEAN DEFAULT false,
    "resultedInConversation" BOOLEAN DEFAULT false,
    "responseTimeMinutes" INT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_target ON user_behaviors ("userId", "targetUserId");
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_action ON user_behaviors ("userId", action);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_target ON user_behaviors ("targetUserId");
CREATE INDEX IF NOT EXISTS idx_user_behaviors_created ON user_behaviors ("createdAt");

CREATE TABLE IF NOT EXISTS elo_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL UNIQUE,
    score DECIMAL(6, 2) DEFAULT 1200,
    "totalLikesReceived" INT DEFAULT 0,
    "totalLikesGiven" INT DEFAULT 0,
    "totalMatches" INT DEFAULT 0,
    "totalConversations" INT DEFAULT 0,
    "responseRate" DECIMAL(5, 2) DEFAULT 0,
    "avgResponseTimeMinutes" INT DEFAULT 0,
    "attractivenessPercentile" DECIMAL(5, 2) DEFAULT 0.5,
    "profileViews" INT DEFAULT 0,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "photoId" VARCHAR NOT NULL UNIQUE,
    "userId" VARCHAR NOT NULL,
    "totalViews" INT DEFAULT 0,
    "likesReceived" INT DEFAULT 0,
    "passesAfterView" INT DEFAULT 0,
    "conversionRate" DECIMAL(5, 4) DEFAULT 0,
    "superLikesReceived" INT DEFAULT 0,
    "avgViewDurationMs" DECIMAL(5, 2) DEFAULT 0,
    "order" INT DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_analytics_user ON photo_analytics ("userId");

CREATE TABLE IF NOT EXISTS conversation_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "matchId" VARCHAR NOT NULL,
    "messagesSent" INT DEFAULT 0,
    "messagesReceived" INT DEFAULT 0,
    "avgMessageLength" INT DEFAULT 0,
    "avgResponseTimeMinutes" INT DEFAULT 0,
    "responseRate" DECIMAL(5, 4) DEFAULT 0,
    "didMeet" BOOLEAN DEFAULT false,
    "conversationDurationHours" INT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_signals_user_match ON conversation_signals ("userId", "matchId");
CREATE INDEX IF NOT EXISTS idx_conv_signals_match ON conversation_signals ("matchId");
