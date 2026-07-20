export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    statusCode: number;
    message: string;
    errors?: string[];
  };
  meta?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    errors?: string[];
  };
  timestamp: string;
  requestId?: string;
}
