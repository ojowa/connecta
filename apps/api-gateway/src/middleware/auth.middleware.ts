import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly publicPaths = [
    '/v1/content',
    '/v1/support',
    '/v1/auth/register',
    '/v1/auth/login',
    '/v1/auth/otp/send',
    '/v1/auth/otp/verify',
    '/v1/auth/refresh',
    '/v1/auth/biometric/login',
    '/v1/auth/password/forgot',
    '/v1/auth/password/reset',
  ];

  use(req: Request, _res: Response, next: NextFunction) {
    const url = (req as any).originalUrl || req.url;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (this.publicPaths.some((p) => url.startsWith(p))) {
        return next();
      }
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload: any = jwt.decode(token);
      if (payload && payload.sub) {
        (req as any).userId = payload.sub;
      }
    } catch {
      // Token invalid — continue without userId, downstream services will reject if needed
    }

    next();
  }
}
