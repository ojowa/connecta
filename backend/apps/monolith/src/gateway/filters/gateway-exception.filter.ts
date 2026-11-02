import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GatewayExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      this.logger.error(
        `Unhandled ${host.getType()} exception`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: string[] | undefined;
    let code: string | undefined;
    let errorLabel: string | undefined;
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        const respMessage = resp.message;
        if (Array.isArray(respMessage)) {
          const messages = respMessage.filter((item): item is string => typeof item === 'string');
          message = messages[0] ?? exception.message;
          errors = messages.length > 0 ? messages : undefined;
        } else if (typeof respMessage === 'string') {
          message = respMessage;
        } else {
          message = exception.message;
        }
        code =
          typeof resp.code === 'string'
            ? resp.code
            : typeof resp.errorCode === 'string'
              ? resp.errorCode
              : undefined;
        errorLabel = typeof resp.error === 'string' ? resp.error : undefined;
        details = resp.details ?? resp.info;
        if (details === undefined && resp.status === 'error') {
          details = { info: resp.info, error: resp.error };
        }
        if (!respMessage && resp.status === 'error') {
          message = 'Service unavailable';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unhandled non-Error exception: ${String(exception)}`);
    }

    const statusCodeName = HttpStatus[status] as unknown as string | undefined;
    const requestIdHeader = request.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        code: code ?? statusCodeName ?? 'HTTP_ERROR',
        error: errorLabel ?? statusCodeName ?? 'Error',
        message: Array.isArray(message) ? message[0] : message,
        errors,
        details,
        timestamp: new Date().toISOString(),
        path: request.originalUrl || request.url,
        method: request.method,
        requestId,
      },
    });
  }
}
