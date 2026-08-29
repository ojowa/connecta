export interface Moment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  caption?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  viewCount: number;
  hasViewed?: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface MomentWithUser extends Moment {
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  } | null;
  viewed: boolean;
}

export interface MyMoment extends Moment {
  expired: boolean;
}

export interface MomentFeedResponse {
  moments: MomentWithUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MyMomentsResponse {
  moments: MyMoment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMomentPayload {
  caption?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface ViewMomentResponse {
  viewed: boolean;
}

export interface DeleteMomentResponse {
  deleted: boolean;
}