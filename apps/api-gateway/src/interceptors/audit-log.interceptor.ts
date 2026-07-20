import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuditLogEntry {
  timestamp: string;
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  statusCode: number;
  userAgent?: string;
  ip?: string;
  duration: number;
  action: string;
  targetType?: string;
  targetId?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const entry: AuditLogEntry = {
          timestamp: new Date().toISOString(),
          requestId: request.headers['x-request-id'] || 'unknown',
          userId: request.user?.id || request.body?._userId || undefined,
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          userAgent: request.headers['user-agent'],
          ip: request.ip || request.connection?.remoteAddress,
          duration,
          action: this.mapRouteToAction(request.method, request.url),
          targetType: this.extractTargetType(request.url),
          targetId: this.extractTargetId(request),
        };

        if (response.statusCode >= 400) {
          this.logger.warn(JSON.stringify(entry));
        } else {
          this.logger.log(JSON.stringify(entry));
        }
      }),
    );
  }

  private mapRouteToAction(method: string, path: string): string {
    const routeMap: Record<string, string> = {
      'POST /v1/auth/login': 'auth.login',
      'POST /v1/auth/register': 'auth.register',
      'POST /v1/matching/like': 'matching.like',
      'POST /v1/matching/pass': 'matching.pass',
      'POST /v1/matching/superlike': 'matching.superlike',
      'POST /v1/chat': 'chat.message',
      'POST /v1/admin/users': 'admin.user_action',
      'POST /v1/admin/reports': 'admin.report_action',
    };
    return routeMap[`${method} ${path.split('?')[0]}`] || `${method.toLowerCase()}.${path.split('/')[2] || 'root'}`;
  }

  private extractTargetType(path: string): string | undefined {
    const segments = path.split('/');
    if (segments.includes('users')) return 'user';
    if (segments.includes('reports')) return 'report';
    if (segments.includes('messages')) return 'message';
    if (segments.includes('matches')) return 'match';
    return undefined;
  }

  private extractTargetId(request: any): string | undefined {
    return request.params?.id || request.params?.userId || request.params?.matchId || request.params?.messageId || undefined;
  }
}
