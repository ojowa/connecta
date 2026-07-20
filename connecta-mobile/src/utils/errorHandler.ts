import { logger } from './logger';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class AppError extends Error {
  severity: ErrorSeverity;
  code: string;
  context: Record<string, unknown>;

  constructor(message: string, code: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

export const errorHandler = {
  handle(error: unknown, context?: Record<string, unknown>): void {
    if (error instanceof AppError) {
      logger.error(`[${error.code}] ${error.message}`, error.context);
    } else if (error instanceof Error) {
      logger.error('[Error]', error.message, context);
    } else {
      logger.error('[UnknownError]', error);
    }
  },
};
