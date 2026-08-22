import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

const defaultStore = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class ThrottlerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const throttleConfig = this.reflector.getAllAndOverride<ThrottleConfig>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!throttleConfig) return true;

    const request = context.switchToHttp().getRequest();
    const clientId = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const key = `${context.getHandler().toString()}:${clientId}`;

    const now = Date.now();
    const record = defaultStore.get(key);

    if (!record || now > record.resetTime) {
      defaultStore.set(key, { count: 1, resetTime: now + throttleConfig.ttl });
      return true;
    }

    record.count++;

    if (record.count > throttleConfig.limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
