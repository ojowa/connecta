import { Injectable, Scope } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService {
  private context: string;
  private logLevel: LogLevel;

  constructor(context?: string) {
    this.context = context || 'App';
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  log(message: string, context?: string) {
    this.writeLog(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.writeLog(LogLevel.ERROR, message, context, trace);
  }

  warn(message: string, context?: string) {
    this.writeLog(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: string) {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string) {
    this.writeLog(LogLevel.VERBOSE, message, context);
  }

  child(context: string): AppLoggerService {
    const logger = new AppLoggerService(context);
    return logger;
  }

  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    const meta = {
      method,
      url,
      statusCode,
      duration,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.writeLog(LogLevel.INFO, `HTTP ${method} ${url} ${statusCode} ${duration}ms`, 'HTTP', JSON.stringify(meta));
  }

  logError(error: Error, context?: string, additionalInfo?: Record<string, any>) {
    const meta = {
      error: error.message,
      stack: error.stack,
      name: error.name,
      ...additionalInfo,
      timestamp: new Date().toISOString(),
    };
    this.writeLog(LogLevel.ERROR, error.message, context, JSON.stringify(meta));
  }

  logEvent(event: string, data?: Record<string, any>, context?: string) {
    const meta = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    this.writeLog(LogLevel.INFO, `Event: ${event}`, context || 'Events', JSON.stringify(meta));
  }

  private writeLog(level: LogLevel, message: string, context?: string, trace?: string) {
    const logLevels: Record<LogLevel, number> = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      [LogLevel.VERBOSE]: 4,
    };

    if (logLevels[level] > logLevels[this.logLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const ctx = context || this.context;
    const logEntry = {
      timestamp,
      level,
      context: ctx,
      message,
      ...(trace && { trace }),
    };

    const output = JSON.stringify(logEntry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }
}
