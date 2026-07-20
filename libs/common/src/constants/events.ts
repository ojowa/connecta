export const USER_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_DEACTIVATED: 'user.deactivated',
  USER_REACTIVATED: 'user.reactivated',
  USER_BANNED: 'user.banned',
  USER_UNBANNED: 'user.unbanned',
  EMAIL_VERIFIED: 'email.verified',
  PHONE_VERIFIED: 'phone.verified',
  PASSWORD_CHANGED: 'password.changed',
  PROFILE_COMPLETED: 'profile.completed',
  TWO_FA_ENABLED: '2fa.enabled',
  TWO_FA_DISABLED: '2fa.disabled',
} as const;

export const PROFILE_EVENTS = {
  PROFILE_CREATED: 'profile.created',
  PROFILE_UPDATED: 'profile.updated',
  INTERESTS_UPDATED: 'interests.updated',
  PHOTOS_UPDATED: 'photos.updated',
  LOCATION_UPDATED: 'location.updated',
} as const;

export const MATCH_EVENTS = {
  SWIPE_PERFORMED: 'swipe.performed',
  MATCH_CREATED: 'match.created',
  MATCH_MUTUAL: 'match.mutual',
  SUPER_LIKE_SENT: 'super_like.sent',
  UNMATCH: 'unmatch',
} as const;

export const CHAT_EVENTS = {
  MESSAGE_SENT: 'message.sent',
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_READ: 'message.read',
  MESSAGE_DELETED: 'message.deleted',
  MESSAGE_REACTION: 'message.reaction',
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_UPDATED: 'conversation.updated',
  TYPING_START: 'typing.start',
  TYPING_STOP: 'typing.stop',
  USER_ONLINE: 'user.online',
  USER_OFFLINE: 'user.offline',
  USER_TYPING: 'user.typing',
} as const;

export const CALL_EVENTS = {
  CALL_INITIATED: 'call.initiated',
  CALL_ANSWERED: 'call.answered',
  CALL_REJECTED: 'call.rejected',
  CALL_ENDED: 'call.ended',
  CALL_MISSED: 'call.missed',
  ICE_CANDIDATE: 'ice.candidate',
  SDP_OFFER: 'sdp.offer',
  SDP_ANSWER: 'sdp.answer',
  CALL_RINGING: 'call.ringing',
} as const;

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_CLICKED: 'notification.clicked',
} as const;

export const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_SUCCESSFUL: 'payment.successful',
  PAYMENT_FAILED: 'payment.failed',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
} as const;

export const MEDIA_EVENTS = {
  MEDIA_UPLOADED: 'media.uploaded',
  MEDIA_DELETED: 'media.deleted',
  MEDIA_PROCESSED: 'media.processed',
  MEDIA_REPORTED: 'media.reported',
} as const;

export const MODERATION_EVENTS = {
  CONTENT_REPORTED: 'content.reported',
  CONTENT_REVIEWED: 'content.reviewed',
  USER_WARNED: 'user.warned',
  USER_SUSPENDED: 'user.suspended',
  USER_BANNED: 'user.banned',
} as const;

export const SYNC_EVENTS = {
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',
  CONFLICT_DETECTED: 'conflict.detected',
  CONFLICT_RESOLVED: 'conflict.resolved',
} as const;
