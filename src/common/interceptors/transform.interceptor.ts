/**
 * common/interceptors/transform.interceptor.ts - Response Wrapper
 * =================================================================
 * An Interceptor in NestJS is like middleware that runs AFTER your controller
 * method returns data but BEFORE the response is sent to the client.
 *
 * This interceptor wraps every response in a consistent shape:
 *
 * {
 *   meta: {
 *     statusCode: 200,
 *     success: true,
 *     message: "Success",
 *     timestamp: "2026-02-19T...",
 *     path: "/api/v1/users/profile"
 *   },
 *   data: { ... your actual response data ... }
 * }
 *
 * For paginated responses, it also includes pagination info in meta.
 *
 * Why this matters: Your Next.js frontend can ALWAYS expect this shape,
 * making it easy to write generic API handling code.
 *
 * IMPROVEMENT over Redymit: Instead of special-casing auth routes with
 * hardcoded path checks, we use a cleaner approach where auth services
 * return the token naturally, and the interceptor handles it generically.
 */

import { RESPONSE_MESSAGE } from '@common/decorators/response-message.decorator';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseMeta {
  statusCode: number;
  success: boolean;
  message: string;
  timestamp: string;
  path: string;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
  token?: string;
}

export interface ApiResponseShape<T> {
  meta: ApiResponseMeta;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseShape<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseShape<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get custom message from @ResponseMessage() decorator if set
    const customMessage = Reflect.getMetadata(
      RESPONSE_MESSAGE,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        const meta: ApiResponseMeta = {
          statusCode: response.statusCode,
          success: response.statusCode < 400,
          message: customMessage || 'Success',
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        // Handle paginated responses
        if (this.isPaginatedData(data)) {
          const { items, total, page, perPage, totalPages, ...rest } = data;
          meta.pagination = { total, page, perPage, totalPages };
          return { meta, data: items as T };
        }

        // Handle auth responses (token is present in data)
        if (data && typeof data === 'object' && 'token' in data) {
          const { token, ...rest } = data as any;
          meta.token = token;
          return { meta, data: rest as T };
        }

        // Standard response
        return { meta, data };
      }),
    );
  }

  private isPaginatedData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.items) &&
      typeof data.total === 'number' &&
      typeof data.page === 'number' &&
      typeof data.perPage === 'number' &&
      typeof data.totalPages === 'number'
    );
  }
}
