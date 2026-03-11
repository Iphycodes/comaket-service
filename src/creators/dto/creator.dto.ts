/**
 * creators/dto/creator.dto.ts - Creator DTOs
 * =============================================
 * A Creator is a PERSONAL profile — like a seller account.
 * Business details (businessName, address) live on Stores, not here.
 *
 * BecomeCreatorDto: What the "Become a Creator" form sends.
 * UpdateCreatorDto: For editing the creator profile after creation.
 * QueryCreatorsDto: For filtering/searching creators on the marketplace.
 */

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';
import { CreatorPlan, CreatorStatus } from '@config/contants';

// ═══════════════════════════════════════════════════════════════
// SOCIAL LINKS (embedded)
// ═══════════════════════════════════════════════════════════════

class SocialLinksDto {
  @ApiPropertyOptional({ example: 'emeka_tech' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ example: 'emeka_tech' })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ example: 'emeka_tech' })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ example: '@emeka_tech' })
  @IsString()
  @IsOptional()
  tiktok?: string;

  @ApiPropertyOptional({ example: '@emeka_tech' })
  @IsString()
  @IsOptional()
  youtube?: string;
}

// ═══════════════════════════════════════════════════════════════
// BANK DETAILS (for payouts)
// ═══════════════════════════════════════════════════════════════

export class BankDetailsDto {
  @ApiProperty({ example: 'Guaranty Trust Bank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: '058' })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'Emeka Okafor' })
  @IsString()
  @IsNotEmpty()
  accountName: string;
}

class CreatorLocationDto {
  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'Ikeja' })
  @IsString()
  @IsOptional()
  city?: string;
}

// ═══════════════════════════════════════════════════════════════
// BECOME CREATOR - When a user upgrades to creator
// ═══════════════════════════════════════════════════════════════

export class BecomeCreatorDto {
  @ApiProperty({
    example: 'emeka_tech',
    description: 'Unique username / display handle',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    example: 'Emeka',
    description: 'First name (updates the User record)',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Okafor',
    description: 'Last name (updates the User record)',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Tech enthusiast selling quality electronics across Nigeria.',
    description: 'Short bio / about me',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    example: 'contact@emeka.ng',
    description: 'Public contact email (can differ from account email)',
  })
  @IsString()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '2348012345678' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '2348012345678',
    description: 'WhatsApp number for customer contact',
  })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiPropertyOptional({
    example: 'https://emeka.ng',
    description: 'Personal or portfolio website',
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ type: SocialLinksDto })
  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/comaket/image/upload/v1/photo.jpg',
    description: 'Profile image URL',
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    example: ['Electronics', 'Phones'],
    description: 'Industries / niches the creator operates in',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @ApiPropertyOptional({
    example: { country: 'Nigeria', state: 'Lagos', city: 'Ikeja' },
    description: 'Creator location',
  })
  @ValidateNested()
  @Type(() => CreatorLocationDto)
  @IsOptional()
  location?: CreatorLocationDto;

  @ApiPropertyOptional({
    example: ['tailor', 'ankara', 'bespoke', 'ready-to-wear'],
    description: 'Searchable tags/keywords based on selected industries',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    example: 'starter',
    description: 'Plan ID — starter, pro, or business',
  })
  @IsString()
  @IsOptional()
  planId?: string;
}

// ═══════════════════════════════════════════════════════════════
// UPDATE CREATOR - For editing creator profile
// PartialType makes all BecomeCreatorDto fields optional
// ═══════════════════════════════════════════════════════════════

export class UpdateCreatorDto extends PartialType(BecomeCreatorDto) {
  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/work1.jpg', 'https://example.com/work2.jpg'],
    description: 'Portfolio/showcase images (Pro and Business plans)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  featuredWorks?: string[];
}

// ═══════════════════════════════════════════════════════════════
// QUERY CREATORS - For browsing/searching creators on the marketplace
// Extends PaginationDto to inherit page, perPage, sort, search
// ═══════════════════════════════════════════════════════════════

export class QueryCreatorsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: CreatorStatus,
    description: 'Filter by creator status',
  })
  @IsEnum(CreatorStatus)
  @IsOptional()
  status?: CreatorStatus;

  @ApiPropertyOptional({
    enum: CreatorPlan,
    description: 'Filter by subscription plan',
  })
  @IsEnum(CreatorPlan)
  @IsOptional()
  plan?: CreatorPlan;

  @ApiPropertyOptional({
    example: 'Electronics',
    description: 'Filter by industry',
  })
  @IsString()
  @IsOptional()
  industry?: string;

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
    description: 'Only show verified creators',
  })
  @IsOptional()
  isVerified?: boolean;
}