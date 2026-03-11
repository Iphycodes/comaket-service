import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';
import { FeaturedWorkOwnerType } from '../schema/featured-works.schema';

// ═══════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════

export class CreateFeaturedWorkDto {
  @ApiProperty({ enum: FeaturedWorkOwnerType, example: 'creator' })
  @IsEnum(FeaturedWorkOwnerType)
  @IsNotEmpty()
  ownerType: FeaturedWorkOwnerType;

  @ApiProperty({
    example: '65a1b2c3d4e5f6a7b8c9d0e1',
    description: 'Creator or Store ID',
  })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({
    example: [
      'https://res.cloudinary.com/comaket/image/upload/v1/work1.jpg',
      'https://res.cloudinary.com/comaket/image/upload/v1/work2.jpg',
    ],
    description: 'Array of image URLs (at least 1)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @ApiPropertyOptional({ example: 'Custom Built Gaming PC' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Built for a client — RTX 4090, 64GB RAM.' })
  @IsString()
  @IsOptional()
  description?: string;
}

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

export class UpdateFeaturedWorkDto {
  @ApiPropertyOptional({
    example: ['https://res.cloudinary.com/comaket/image/upload/v1/new1.jpg'],
    description: 'Replace entire images array',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    example: ['https://res.cloudinary.com/comaket/image/upload/v1/extra.jpg'],
    description: 'Add images to the existing array',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addImages?: string[];

  @ApiPropertyOptional({
    example: ['https://res.cloudinary.com/comaket/image/upload/v1/old.jpg'],
    description: 'Remove specific images from the array',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeImages?: string[];

  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description.' })
  @IsString()
  @IsOptional()
  description?: string;
}

// ═══════════════════════════════════════════════════════════════
// REORDER - Send full array of IDs in desired order
// ═══════════════════════════════════════════════════════════════

export class ReorderFeaturedWorksDto {
  @ApiProperty({ enum: FeaturedWorkOwnerType, example: 'creator' })
  @IsEnum(FeaturedWorkOwnerType)
  @IsNotEmpty()
  ownerType: FeaturedWorkOwnerType;

  @ApiProperty({ example: '65a1b2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({
    example: ['id3', 'id1', 'id2'],
    description: 'Array of featured work IDs in desired display order',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  orderedIds: string[];
}

// ═══════════════════════════════════════════════════════════════
// QUERY
// ═══════════════════════════════════════════════════════════════

export class QueryFeaturedWorksDto extends PaginationDto {
  @ApiProperty({ enum: FeaturedWorkOwnerType, example: 'creator' })
  @IsEnum(FeaturedWorkOwnerType)
  @IsNotEmpty()
  ownerType: FeaturedWorkOwnerType;

  @ApiProperty({ example: '65a1b2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
