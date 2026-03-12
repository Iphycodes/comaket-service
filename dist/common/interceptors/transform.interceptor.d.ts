import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
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
export declare class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseShape<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseShape<T>>;
    private isPaginatedData;
}
