const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE && typeof window !== "undefined") {
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

export interface ApiErrorOptions {
  status: number;
  code?: string;
  errors?: string[];
  details?: unknown;
  requestId?: string;
  path?: string;
  payload?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: string[];
  readonly details?: unknown;
  readonly requestId?: string;
  readonly path?: string;
  readonly payload?: unknown;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.errors = options.errors;
    this.details = options.details;
    this.requestId = options.requestId;
    this.path = options.path;
    this.payload = options.payload;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function formatApiError(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof ApiError) {
    const label = error.code ?? (error.status > 0 ? `HTTP ${error.status}` : undefined);
    return label ? `${error.message} (${label})` : error.message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  return undefined;
}

function extractApiError(body: unknown, status: number): ApiError {
  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const errorPayload =
    payload.error && typeof payload.error === "object"
      ? (payload.error as Record<string, unknown>)
      : undefined;
  const message =
    readMessage(errorPayload?.message) ??
    readString(payload.error) ??
    readMessage(payload.message) ??
    readString(body) ??
    `API error ${status}`;
  const code =
    readString(errorPayload?.code) ??
    readString(payload.code) ??
    readString(errorPayload?.errorCode) ??
    readString(payload.errorCode);
  const rawErrors = Array.isArray(errorPayload?.errors)
    ? errorPayload.errors
    : Array.isArray(payload.errors)
      ? payload.errors
      : undefined;
  const errors = rawErrors?.filter((item): item is string => typeof item === "string");
  const details = errorPayload?.details ?? payload.details;
  const requestId = readString(errorPayload?.requestId) ?? readString(payload.requestId);
  const path = readString(errorPayload?.path) ?? readString(payload.path);

  return new ApiError(message, { status, code, errors, details, requestId, path, payload: body });
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  if (!API_BASE) {
    throw new ApiError("NEXT_PUBLIC_API_URL environment variable is not set", {
      status: 0,
      code: "API_URL_MISSING",
    });
  }

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const isAuthRequest = endpoint === "/admin/login" || endpoint === "/admin/2fa/verify";
  const token = isAuthRequest ? null : getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, { ...fetchOptions, headers });
  } catch (cause) {
    throw new ApiError("Network request failed", {
      status: 0,
      code: "NETWORK_ERROR",
      details: cause,
    });
  }

  const body = await readBody(res);

  if (!res.ok) {
    const error = extractApiError(body, res.status);
    if (res.status === 401 && !isAuthRequest) {
      setAccessToken(null);
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    throw error;
  }

  if (res.status === 204 || body === undefined) return undefined as T;
  if (typeof body === "string") return body as unknown as T;
  if (body && typeof body === "object" && (body as Record<string, unknown>).success === true && "data" in body) {
    return (body as Record<string, unknown>).data as T;
  }
  return body as T;
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
