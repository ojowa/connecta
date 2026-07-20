import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;

  constructor(context?: string) {
    this.context = context || 'App';
  }

  log(message: string, context?: string) {
    console.log(`[${this.getLogTimestamp()}] [${context || this.context}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${this.getLogTimestamp()}] [${context || this.context}] ${message}`, trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[${this.getLogTimestamp()}] [${context || this.context}] ${message}`);
  }

  debug(message: string, context?: string) {
    console.debug(`[${this.getLogTimestamp()}] [${context || this.context}] ${message}`);
  }

  verbose(message: string, context?: string) {
    console.log(`[${this.getLogTimestamp()}] [${context || this.context}] ${message}`);
  }

  private getLogTimestamp(): string {
    return new Date().toISOString();
  }
}
