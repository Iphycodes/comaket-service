/**
 * stores/dto/store.dto.ts - Store DTOs
 * =======================================
 * Data shapes for store operations.
 */

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';
import { StoreStatus } from '@config/contants';

// ═══════════════════════════════════════════════════════════════
// EMBEDDED DTOS
// ═══════════════════════════════════════════════════════════════

class StoreLocationDto {
  @ApiPropertyOptional({ example: '12 Broad Street' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ example: 'Ikeja' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '100001' })
  @IsString()
  @IsOptional()
  zipCode?: string;
}

class OperatingHoursDto {
  @ApiPropertyOptional({ example: '9:00 AM - 6:00 PM' })
  @IsString()
  @IsOptional()
  monday?: string;

  @ApiPropertyOptional({ example: '9:00 AM - 6:00 PM' })
  @IsString()
  @IsOptional()
  tuesday?: string;

  @ApiPropertyOptional({ example: '9:00 AM - 6:00 PM' })
  @IsString()
  @IsOptional()
  wednesday?: string;

  @ApiPropertyOptional({ example: '9:00 AM - 6:00 PM' })
  @IsString()
  @IsOptional()
  thursday?: string;

  @ApiPropertyOptional({ example: '9:00 AM - 6:00 PM' })
  @IsString()
  @IsOptional()
  friday?: string;

  @ApiPropertyOptional({ example: '10:00 AM - 4:00 PM' })
  @IsString()
  @IsOptional()
  saturday?: string;

  @ApiPropertyOptional({ example: 'Closed' })
  @IsString()
  @IsOptional()
  sunday?: string;
}

class StoreBankDetailsDto {
  @ApiPropertyOptional({ example: 'GTBank' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: '058' })
  @IsString()
  @IsOptional()
  bankCode?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  accountName?: string;
}

class SocialLinksDto {
  @ApiPropertyOptional({ example: 'my_store' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ example: 'my_store' })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ example: 'my_store' })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ example: '@my_store' })
  @IsString()
  @IsOptional()
  tiktok?: string;

  @ApiPropertyOptional({ example: 'MyStoreChannel' })
  @IsString()
  @IsOptional()
  youtube?: string;
}

class NotificationsDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  newOrder?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  newReview?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  lowStock?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  promotions?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CREATE STORE
// ═══════════════════════════════════════════════════════════════

export class CreateStoreDto {
  @ApiProperty({
    example: "John's Clothing Store",
    description: 'Store display name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Premium clothing and accessories' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Wear the difference' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({ example: 'https://mystore.ng' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '+2348012345678',
    description: 'WhatsApp number for this specific store',
  })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: 'store@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: ['fashion', 'accessories'],
    description: 'Store categories',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({
    example: ['menswear', 'casual', 'streetwear'],
    description: 'Tags for store discovery',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ type: StoreLocationDto })
  @ValidateNested()
  @Type(() => StoreLocationDto)
  @IsOptional()
  location?: StoreLocationDto;

  @ApiPropertyOptional({ type: SocialLinksDto })
  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({ type: OperatingHoursDto })
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  @IsOptional()
  operatingHours?: OperatingHoursDto;

  @ApiPropertyOptional({
    example: {
      bankName: 'GTBank',
      bankCode: '058',
      accountNumber: '0123456789',
      accountName: 'John Doe',
    },
    description: 'Bank details for store-level payouts',
  })
  @ValidateNested()
  @Type(() => StoreBankDetailsDto)
  @IsOptional()
  bankDetails?: StoreBankDetailsDto;

  @ApiPropertyOptional({
    example: 'Returns accepted within 7 days of delivery.',
  })
  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @ApiPropertyOptional({ type: NotificationsDto })
  @ValidateNested()
  @Type(() => NotificationsDto)
  @IsOptional()
  notifications?: NotificationsDto;
}

// ═══════════════════════════════════════════════════════════════
// UPDATE STORE
// ═══════════════════════════════════════════════════════════════

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  // Accept "bio" as alias for "description" from frontend
  @ApiPropertyOptional({ example: 'Our store bio/about text' })
  @IsString()
  @IsOptional()
  bio?: string;
}

// ═══════════════════════════════════════════════════════════════
// QUERY STORES - For marketplace browsing
// ═══════════════════════════════════════════════════════════════

export class QueryStoresDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: StoreStatus,
    description: 'Filter by store status',
  })
  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;

  @ApiPropertyOptional({
    example: 'fashion',
    description:
      'Filter by category (matches any store that includes this category)',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: 'Lagos',
    description: 'Filter by state (location.state)',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    example: 'Ikeja',
    description: 'Filter by city (location.city)',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter stores by creator ID',
  })
  @IsString()
  @IsOptional()
  creatorId?: string;
}
