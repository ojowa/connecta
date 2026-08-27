CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profileId" VARCHAR NOT NULL,
    "viewerId" VARCHAR NOT NULL,
    "viewedAt" TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_profile_viewer
  ON profile_views ("profileId", "viewerId");

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id
  ON profile_views ("profileId");

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id
  ON profile_views ("viewerId");
