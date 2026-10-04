CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR NOT NULL,
    "selfieUrl" TEXT NOT NULL,
    status VARCHAR DEFAULT 'pending',
    "reviewedAt" TIMESTAMP NULL,
    "rejectionReason" TEXT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id
  ON verification_requests ("userId");

CREATE INDEX IF NOT EXISTS idx_verification_requests_status
  ON verification_requests (status);
