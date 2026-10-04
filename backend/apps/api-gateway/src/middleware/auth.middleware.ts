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

    const isPublic = this.publicPaths.some((p) => url.startsWith(p));

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isPublic) {
        return next();
      }
      return next();
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    try {
      const payload: any = jwt.verify(token, jwtSecret);
      if (payload && payload.sub) {
        (req as any).userId = payload.sub;
      }
    } catch {
      if (!isPublic) {
        return next();
      }
    }

    next();
  }
}
