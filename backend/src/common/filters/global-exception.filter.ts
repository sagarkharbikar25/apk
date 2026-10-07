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
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: { field?: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || message;

        // Handle class-validator array of errors
        if (Array.isArray(res.message)) {
          message = 'Validation failed';
          errors = (res.message as string[]).map((msg) => ({ message: msg }));
        }
      }
    } else if (exception instanceof Error) {
      // Log full detail server-side only — NEVER send raw error to client (data leak)
      this.logger.error(`[Unhandled] ${exception.message}`, exception.stack);
      message = 'An unexpected error occurred. Please try again later.';
    }

    response.status(statusCode).json({
      statusCode,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
