import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000;
  private readonly maxTimeout = 300000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestedTimeout = Number(request.headers['x-timeout']);
    const timeout =
      Number.isFinite(requestedTimeout) && requestedTimeout > 0
        ? Math.min(requestedTimeout, this.maxTimeout)
        : this.defaultTimeout;

    return new Observable((subscriber) => {
      const timer = setTimeout(() => {
        subscriber.error(new RequestTimeoutException('Request timeout'));
      }, timeout);

      next.handle().subscribe({
        next: (value) => {
          clearTimeout(timer);
          subscriber.next(value);
          subscriber.complete();
        },
        error: (err) => {
          clearTimeout(timer);
          subscriber.error(err);
        },
        complete: () => {
          clearTimeout(timer);
          subscriber.complete();
        },
      });
    });
  }
}
