import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { LoggingInterceptor } from './logging.interceptor';

@Global()
@Module({
  providers: [AppLoggerService, LoggingInterceptor],
  exports: [AppLoggerService, LoggingInterceptor],
})
export class LoggerLibModule {}
