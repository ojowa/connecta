export interface DBUser {
  id: string;
  email: string;
  phone: string;
  display_name: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  latitude: number;
  longitude: number;
  last_active_at: string;
  is_verified: number;
  profile_completion: number;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
}

export interface DBConversation {
  id: string;
  last_message_id: string;
  last_message_at: string;
  created_at: string;
}

export interface DBSyncQueue {
  id: string;
  type: string;
  payload: string;
  status: string;
  priority: number;
  retry_count: number;
  created_at: string;
}

export interface LocalConversation {
  id: string;
  match_id: string | null;
  other_user_id: string;
  other_user_name: string | null;
  other_user_photo: string | null;
  last_message: string | null;
  last_message_at: number | null;
  unread_count: number;
  is_archived: number;
  created_at: number;
  updated_at: number;
}

export interface LocalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  content_type: string;
  media_url: string | null;
  media_local_path: string | null;
  reply_to_id: string | null;
  is_deleted: number;
  is_sent: number;
  is_read: number;
  created_at: number;
  sent_at: number | null;
  updated_at: number;
}

export interface LocalProfileCache {
  user_id: string;
  data: string;
  version: number;
  cached_at: number;
}

export interface LocalFeedCache {
  user_id: string;
  data: string;
  score: number;
  cached_at: number;
}

export interface LocalPreference {
  key: string;
  value: string;
  updated_at: number;
  synced: number;
}

export interface LocalSyncOutbox {
  id: number;
  operation: string;
  entity_type: string;
  entity_id: string;
  payload: string | null;
  created_at: number;
  retry_count: number;
  last_retry_at: number | null;
  status: string;
}

export interface LocalEncryptionKey {
  id: string;
  key_type: string;
  key_data: string;
  associated_data: string | null;
  created_at: number;
  rotated_at: number | null;
  expires_at: number | null;
}

export interface SyncMetadata {
  key: string;
  value: string;
  updated_at: number;
}
