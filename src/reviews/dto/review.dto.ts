/**
 * reviews/dto/review.dto.ts - Review DTOs
 * ==========================================
 * All target fields are optional. At least one must be provided.
 * Anonymous reviews are supported (no auth required).
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';

export class CreateReviewDto {
  @ApiPropertyOptional({ description: 'Creator ID to review' })
  @IsString()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({ description: 'Store ID to review' })
  @IsString()
  @IsOptional()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Listing ID to review' })
  @IsString()
  @IsOptional()
  listingId?: string;

  @ApiPropertyOptional({ description: 'Order ID to review' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great quality product, fast delivery!' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Display name for anonymous reviews (ignored if logged in)',
    example: 'Happy Customer',
  })
  @IsString()
  @IsOptional()
  reviewerName?: string;
}

export class SellerReplyDto {
  @ApiProperty({ example: 'Thank you for your kind review!' })
  @IsString()
  @IsNotEmpty()
  reply: string;
}

export class QueryReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by listing ID' })
  @IsString()
  @IsOptional()
  listingId?: string;

  @ApiPropertyOptional({ description: 'Filter by store ID' })
  @IsString()
  @IsOptional()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Filter by creator ID' })
  @IsString()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({ description: 'Filter by order ID' })
  @IsString()
  @IsOptional()
  orderId?: string;
}