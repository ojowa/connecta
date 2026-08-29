export interface AdminUser {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  role: "super_admin" | "moderator";
  status?: "active" | "suspended" | "banned";
  isActive: boolean;
  mfaVerified?: boolean;
  createdAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DashboardMetrics {
  period: string;
  generatedAt: string;
  users: { total: number };
  revenue: { totalRevenueNgn: number; activeSubscriptions: number };
  safety: { totalReports: number };
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  status: "active" | "suspended" | "banned";
  isVerified?: boolean;
  bio?: string;
  createdAt: string;
  subscription?: SubscriptionRecord | null;
}

export interface SubscriptionRecord {
  id: string;
  planId: string;
  status: string;
  expiresAt?: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description?: string;
  evidenceUrls?: string[];
  status: "pending" | "resolved" | "reviewed" | "dismissed" | "escalated";
  reviewedBy?: string;
  actionTaken?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AnalyticsData {
  period: string;
  generatedAt: string;
  users: { total: number; newInPeriod: number; growthRate: string };
  revenue: { totalInPeriod: number; currency: string; activeSubscriptions: number };
  safety: { totalReports: number; pendingReports: number; resolvedReports: number; resolutionRate: string };
  dataPoints: Array<{ date: string; users: number; revenue: number }>;
}

export interface SystemSettings {
  maintenanceMode?: boolean;
  welcomeMessage?: string;
  currency?: string;
  minAge?: number;
  maxAge?: number;
  enableVideoCalls?: boolean;
  enableVoiceCalls?: boolean;
  enableSuperLikes?: boolean;
  maxFreeSuperLikes?: number;
  paymentPlatform?: string;
  paystack?: {
    secretKey?: string;
    publicKey?: string;
    webhookSecret?: string;
  };
  flutterwave?: {
    secretKey?: string;
    publicKey?: string;
    webhookSecret?: string;
  };
  storageProvider?: string;
  storageLocal?: {
    uploadDir?: string;
    baseUrl?: string;
  };
  storageS3?: {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    endpoint?: string;
  };
  storageR2?: {
    accountId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    publicUrl?: string;
  };
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
