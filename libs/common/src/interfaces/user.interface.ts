export interface UserPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  permissions?: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}
