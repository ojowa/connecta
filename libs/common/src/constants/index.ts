export const QUEUES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  MEDIA_PROCESSING: 'media-processing-queue',
  PAYMENT: 'payment-queue',
  MATCHING: 'matching-queue',
  ANALYTICS: 'analytics-queue',
  MODERATION: 'moderation-queue',
  SYNC: 'sync-queue',
} as const;

export const QUEUE_PROCESSORS = {
  SEND_EMAIL: 'send-email',
  PROCESS_MEDIA: 'process-media',
  GENERATE_THUMBNAILS: 'generate-thumbnails',
  PROCESS_PAYMENT: 'process-payment',
  VERIFY_PAYMENT: 'verify-payment',
  CALCULATE_MATCH: 'calculate-match',
  SEND_NOTIFICATION: 'send-notification',
  SYNC_DATA: 'sync-data',
  MODERATE_CONTENT: 'moderate-content',
  GENERATE_ANALYTICS: 'generate-analytics',
} as const;

export const RATE_LIMITS = {
  AUTH: { ttl: 60000, limit: 5 },
  API: { ttl: 60000, limit: 100 },
  SWIPE: { ttl: 86400000, limit: 100 },
  MESSAGE: { ttl: 60000, limit: 30 },
  MEDIA_UPLOAD: { ttl: 3600000, limit: 100 },
  OTP: { ttl: 300000, limit: 3 },
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  USER_PROFILE: 1800,
  MATCH_FEED: 300,
  ONLINE_STATUS: 120,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_LIMITS = {
  MAX_AVATAR_SIZE: 5 * 1024 * 1024,
  MAX_PHOTO_SIZE: 10 * 1024 * 1024,
  MAX_VIDEO_SIZE: 50 * 1024 * 1024,
  MAX_AUDIO_SIZE: 10 * 1024 * 1024,
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  MAX_PHOTOS_PER_PROFILE: 9,
} as const;

export const MESSAGING = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_MEDIA_PER_MESSAGE: 10,
  TYPING_TIMEOUT_MS: 3000,
  MESSAGE_BATCH_SIZE: 50,
  MAX_CONVERSATION_PARTICIPANTS: 2,
} as const;

export const MATCHING = {
  MAX_SWIPES_PER_DAY: 100,
  SUPER_LIKES_PER_DAY: 5,
  MAX_DISTANCE_KM: 500,
  DEFAULT_MIN_AGE: 18,
  DEFAULT_MAX_AGE: 60,
  MATCH_EXPIRY_DAYS: 30,
} as const;

export const CALL = {
  MAX_DURATION_SECONDS: 60 * 60,
  RINGING_TIMEOUT_SECONDS: 30,
  ICE_CANDIDATE_BATCH_SIZE: 5,
} as const;

export const NOTIFICATION_TYPES = {
  NEW_MATCH: 'new_match',
  NEW_MESSAGE: 'new_message',
  NEW_LIKE: 'new_like',
  SUPER_LIKE: 'super_like',
  NEW_CALL: 'new_call',
  MISSED_CALL: 'missed_call',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  PAYMENT_SUCCESS: 'payment_success',
  PROFILE_VIEW: 'profile_view',
  SYSTEM: 'system',
} as const;
