export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non_binary' | 'other';
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned' | 'pending_verification' | 'deactivated';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  requires2fa?: boolean;
  requiresProfileSetup?: boolean;
}

export interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
}

export interface OtpRequest {
  channel: 'email' | 'sms';
  purpose: 'registration' | 'phone_verify' | 'password_reset';
  identifier: string;
}

export interface OtpVerify {
  identifier: string;
  code: string;
  purpose: string;
}
