CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "notificationId" VARCHAR NOT NULL,
    "userId" VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    body TEXT NOT NULL,
    channel VARCHAR NULL,
    platform VARCHAR NULL,
    status VARCHAR DEFAULT 'pending',
    delivered BOOLEAN DEFAULT false,
    opened BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    "deliveredAt" TIMESTAMP NULL,
    "openedAt" TIMESTAMP NULL,
    "clickedAt" TIMESTAMP NULL,
    "failureReason" TEXT NULL,
    metadata JSONB NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON notification_deliveries ("notificationId");
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_id ON notification_deliveries ("userId");
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries (status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_created_at ON notification_deliveries ("createdAt");
