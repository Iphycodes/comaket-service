/**
 * admin/dto/admin.dto.ts - Admin DTOs
 */

import {
  CreatorStatus,
  Currency,
  ItemCondition,
  ListingType,
  StoreStatus,
  UserRole,
} from '@config/contants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateCreatorStatusDto {
  @ApiProperty({ enum: CreatorStatus })
  @IsEnum(CreatorStatus)
  status: CreatorStatus;
}

export class UpdateStoreStatusDto {
  @ApiProperty({ enum: StoreStatus })
  @IsEnum(StoreStatus)
  status: StoreStatus;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['active', 'suspended'] })
  @IsString()
  status: string;
}

export class AdminQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  perPage?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plan?: string;
}

// ═══════════════════════════════════════════════════════════════
// ADMIN CREATE LISTING - Bypasses review, goes straight to live
// ═══════════════════════════════════════════════════════════════

class AdminListingPriceDto {
  @ApiProperty({
    example: 1500000,
    description: 'Price in kobo (e.g. 1500000 = ₦15,000)',
  })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.NGN })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency = Currency.NGN;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  negotiable?: boolean = false;
}

class AdminListingMediaDto {
  @ApiProperty({ example: 'https://example.com/product.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ enum: ['image', 'video'], default: 'image' })
  @IsString()
  @IsOptional()
  type?: string = 'image';

  @ApiPropertyOptional({ description: 'Thumbnail URL for videos' })
  @IsString()
  @IsOptional()
  thumbnail?: string;
}

class AdminListingLocationDto {
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() state?: string;
  @IsString() @IsOptional() city?: string;
}

export class AdminCreateListingDto {
  @ApiProperty({ example: 'Premium Leather Wallet' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ example: 'Genuine leather wallet, handcrafted with care.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ItemCondition, example: ItemCondition.BrandNew })
  @IsEnum(ItemCondition)
  condition: ItemCondition;

  @ApiProperty({
    enum: ListingType,
    example: ListingType.Consignment,
    description: 'Selling type for the listing',
  })
  @IsEnum(ListingType)
  type: ListingType;

  @ApiProperty({ type: AdminListingPriceDto })
  @ValidateNested()
  @Type(() => AdminListingPriceDto)
  askingPrice: AdminListingPriceDto;

  @ApiProperty({
    type: [AdminListingMediaDto],
    description: 'At least 1 image required',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminListingMediaDto)
  media: AdminListingMediaDto[];

  @ApiPropertyOptional({ example: 'fashion' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: ['leather', 'wallet', 'official'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 5, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number = 1;

  @ApiPropertyOptional({ description: 'Item location' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminListingLocationDto)
  location?: AdminListingLocationDto;

  @ApiPropertyOptional({
    example: 2000000,
    description: 'Selling price in kobo (for consignment/direct purchase)',
  })
  @IsNumber()
  @Min(100)
  @IsOptional()
  sellingPrice?: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Commission rate percentage (for consignment)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number;
}