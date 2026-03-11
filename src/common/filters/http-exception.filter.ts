/**
 * common/filters/http-exception.filter.ts - Error Handler
 * =========================================================
 * An Exception Filter catches thrown errors and formats them consistently.
 *
 * Without this, NestJS returns different error shapes depending on the error type.
 * With this, ALL errors follow the same format as success responses:
 *
 * {
 *   meta: {
 *     statusCode: 400,
 *     success: false,
 *     message: "Email already exists",
 *     timestamp: "...",
 *     path: "/api/v1/auth/register"
 *   },
 *   data: null
 * }
 *
 * This is NEW — your Redymit app didn't have this, so error responses had
 * a different shape than success responses. Now they're consistent.
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        errors = resp.errors || null;

        // Handle validation errors (array of messages from ValidationPipe)
        if (Array.isArray(resp.message)) {
          message = resp.message[0]; // First error as main message
          errors = resp.message; // All errors in errors array
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(statusCode).json({
      meta: {
        statusCode,
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(errors && { errors }),
      },
      data: null,
    });
  }
}