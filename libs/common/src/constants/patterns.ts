export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH_TOKEN: 'auth.refresh-token',
  LOGOUT: 'auth.logout',
  FORGOT_PASSWORD: 'auth.forgot-password',
  RESET_PASSWORD: 'auth.reset-password',
  VERIFY_EMAIL: 'auth.verify-email',
  VERIFY_PHONE: 'auth.verify-phone',
  SEND_OTP: 'auth.send-otp',
  VERIFY_OTP: 'auth.verify-otp',
  ENABLE_2FA: 'auth.enable-2fa',
  VERIFY_2FA: 'auth.verify-2fa',
  DISABLE_2FA: 'auth.disable-2fa',
  CHANGE_PASSWORD: 'auth.change-password',
} as const;

export const USER_PATTERNS = {
  GET_PROFILE: 'user.get-profile',
  GET_USER: 'user.get-user',
  UPDATE_USER: 'user.update-user',
  DEACTIVATE_ACCOUNT: 'user.deactivate-account',
  DELETE_ACCOUNT: 'user.delete-account',
  BLOCK_USER: 'user.block-user',
  UNBLOCK_USER: 'user.unblock-user',
  GET_BLOCKED_USERS: 'user.get-blocked-users',
} as const;

export const PROFILE_PATTERNS = {
  CREATE_PROFILE: 'profile.create',
  GET_PROFILE: 'profile.get',
  UPDATE_PROFILE: 'profile.update',
  UPDATE_INTERESTS: 'profile.update-interests',
  UPDATE_LOCATION: 'profile.update-location',
  UPLOAD_PHOTOS: 'profile.upload-photos',
  DELETE_PHOTO: 'profile.delete-photo',
  REORDER_PHOTOS: 'profile.reorder-photos',
  GET_INTERESTS: 'profile.get-interests',
} as const;

export const MATCH_PATTERNS = {
  GET_FEED: 'match.get-feed',
  SWIPE: 'match.swipe',
  GET_MATCHES: 'match.get-matches',
  GET_MATCH_DETAILS: 'match.get-match-details',
  UNMATCH: 'match.unmatch',
  UPDATE_PREFERENCES: 'match.update-preferences',
  GET_PREFERENCES: 'match.get-preferences',
} as const;

export const CHAT_PATTERNS = {
  CREATE_CONVERSATION: 'chat.create-conversation',
  GET_CONVERSATIONS: 'chat.get-conversations',
  GET_MESSAGES: 'chat.get-messages',
  SEND_MESSAGE: 'chat.send-message',
  MARK_READ: 'chat.mark-read',
  DELETE_MESSAGE: 'chat.delete-message',
  REPORT_MESSAGE: 'chat.report-message',
  SEARCH_MESSAGES: 'chat.search-messages',
} as const;

export const CALL_PATTERNS = {
  INITIATE_CALL: 'call.initiate',
  ANSWER_CALL: 'call.answer',
  REJECT_CALL: 'call.reject',
  END_CALL: 'call.end',
  GET_CALL_HISTORY: 'call.get-history',
} as const;

export const MEDIA_PATTERNS = {
  UPLOAD: 'media.upload',
  GET_BY_ID: 'media.get-by-id',
  DELETE: 'media.delete',
  GET_USER_MEDIA: 'media.get-user-media',
  REPORT_MEDIA: 'media.report',
} as const;

export const PAYMENT_PATTERNS = {
  CREATE_SUBSCRIPTION: 'payment.create-subscription',
  GET_SUBSCRIPTION: 'payment.get-subscription',
  CANCEL_SUBSCRIPTION: 'payment.cancel-subscription',
  CREATE_TRANSACTION: 'payment.create-transaction',
  VERIFY_TRANSACTION: 'payment.verify-transaction',
  GET_COINS_BALANCE: 'payment.get-coins-balance',
  PURCHASE_COINS: 'payment.purchase-coins',
  GET_HISTORY: 'payment.get-history',
} as const;

export const NOTIFICATION_PATTERNS = {
  REGISTER_DEVICE: 'notification.register-device',
  REMOVE_DEVICE: 'notification.remove-device',
  SEND: 'notification.send',
  GET_ALL: 'notification.get-all',
  MARK_READ: 'notification.mark-read',
  GET_UNREAD_COUNT: 'notification.get-unread-count',
} as const;

export const SEARCH_PATTERNS = {
  SEARCH_USERS: 'search.search-users',
  SEARCH_MESSAGES: 'search.search-messages',
  GET_SUGGESTIONS: 'search.get-suggestions',
} as const;

export const ADMIN_PATTERNS = {
  GET_DASHBOARD: 'admin.get-dashboard',
  GET_USERS: 'admin.get-users',
  GET_USER_DETAILS: 'admin.get-user-details',
  BAN_USER: 'admin.ban-user',
  UNBAN_USER: 'admin.unban-user',
  GET_REPORTS: 'admin.get-reports',
  REVIEW_REPORT: 'admin.review-report',
  GET_STATS: 'admin.get-stats',
  GET_REVENUE: 'admin.get-revenue',
  GET_RECENT_ACTIVITY: 'admin.get-recent-activity',
  BULK_ACTION: 'admin.bulk-action',
  EXPORT_DATA: 'admin.export-data',
} as const;
