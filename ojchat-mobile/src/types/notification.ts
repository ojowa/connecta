export interface Notification {
  id: string;
  type: 'message' | 'match' | 'call' | 'like' | 'system';
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  messageNotifications: boolean;
  matchNotifications: boolean;
  callNotifications: boolean;
  likeNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
