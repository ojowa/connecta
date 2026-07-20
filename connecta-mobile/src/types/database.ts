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
