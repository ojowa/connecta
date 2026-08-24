import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly publicPrefixes = ['/v1/auth', '/v1/content', '/v1/support'];

  use(req: Request, _res: Response, next: NextFunction) {
    const url = (req as any).originalUrl || req.url;

    if (this.publicPrefixes.some((p) => url.startsWith(p))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
