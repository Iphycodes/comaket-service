/**
 * common/dto/pagination.dto.ts - Pagination Query Parameters
 * =============================================================
 * A DTO (Data Transfer Object) defines the SHAPE of data coming in or going out.
 * Think of it as a contract: "this endpoint expects these fields with these types."
 *
 * This DTO is used for any endpoint that returns a list of items.
 * The frontend sends: GET /api/v1/listings?page=2&perPage=20&sort=-createdAt
 * NestJS auto-validates and converts the query string to this typed object.
 *
 * IMPROVEMENT over Redymit: Added 'sort' and 'search' fields since most list
 * endpoints will need them. Better to have them in the base DTO than repeat
 * them in every feature DTO.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field. Prefix with - for descending. e.g., -createdAt',
    example: '-createdAt',
  })
  @IsOptional()
  @IsString()
  sort?: string = '-createdAt';

  @ApiPropertyOptional({
    description: 'Search query string',
  })
  @IsOptional()
  @IsString()
  search?: string;
}