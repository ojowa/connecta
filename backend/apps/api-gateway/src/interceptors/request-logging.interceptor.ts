import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '@app/logger/logger.service';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, params, headers } = request;
    const userId = request.user?.id;
    const requestId = headers['x-request-id'];
    const start = Date.now();

    this.logger.debug(
      `Incoming request: ${method} ${url} userId=${userId || 'none'} requestId=${requestId || 'none'}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const response = context.switchToHttp().getResponse();
          this.logger.logRequest(method, url, response.statusCode, duration, userId);
        },
        error: (error) => {
          const duration = Date.now() - start;
          this.logger.logError(error, 'HTTP', { method, url, duration, userId });
        },
      }),
    );
  }
}
