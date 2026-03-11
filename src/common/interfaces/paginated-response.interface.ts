/**
 * common/interfaces/paginated-response.interface.ts
 * ===================================================
 * The generic shape for any paginated response from a service.
 * The TransformInterceptor recognizes this shape and auto-formats
 * it into the standard meta.pagination response.
 *
 * Usage in a service:
 *   async findAll(dto: PaginationDto): Promise<PaginatedResponse<Listing>> {
 *     const [items, total] = await ...
 *     return {
 *       items,
 *       total,
 *       page: dto.page,
 *       perPage: dto.perPage,
 *       totalPages: Math.ceil(total / dto.perPage),
 *     };
 *   }
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}