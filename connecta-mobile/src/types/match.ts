import { User } from './auth';

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitle?: string;
  company?: string;
  school?: string;
  city?: string;
  country?: string;
  relationshipGoal?: string;
  verified?: boolean;
  completionPercentage?: number;
  photos: Photo[];
  interests: Interest[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Photo {
  id: string;
  url: string;
  localPath?: string;
  order: number;
  isPrimary: boolean;
  blurHash?: string;
}

export interface Interest {
  id: string;
  name: string;
  category?: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: string;
  compatibilityScore?: number;
  otherUser: User;
}

export interface MatchFeedItem {
  user: User;
  profile: Profile;
  compatibilityScore?: number;
  distance?: number;
}

export interface UserPreference {
  id: string;
  userId: string;
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  genderPreference: string;
}
