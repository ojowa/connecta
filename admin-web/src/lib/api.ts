const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE && typeof window !== 'undefined') {
  console.error('[admin-web] NEXT_PUBLIC_API_URL is not set. API calls will fail.');
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("admin_token", token);
    else localStorage.removeItem("admin_token");
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token");
  }
  return null;
}

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401) {
    setAccessToken(null);
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || body.message || `API error ${res.status}`);
  }

  const json = await res.json();
  if (json && typeof json === "object" && "data" in json && json.success !== undefined) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    request<T>(endpoint, { method: "GET", params }),
  post: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | undefined>) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined, params }),
  put: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | undefined>) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined, params }),
  delete: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    request<T>(endpoint, { method: "DELETE", params }),
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "moderator";
  isActive: boolean;
  mfaVerified?: boolean;
}

export interface PaginatedResponse<T> {
  meta: { page: number; limit: number; total: number; hasMore: boolean };
  [key: string]: unknown;
}
