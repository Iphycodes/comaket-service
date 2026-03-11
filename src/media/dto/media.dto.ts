/**
 * media/dto/media.dto.ts - Media Upload DTOs
 * =============================================
 * Every upload MUST specify what entity it's for and which field.
 *
 * Examples:
 *   Upload avatar for user:
 *     entityType: 'user', entityId: '...', field: 'avatar'
 *
 *   Upload logo for a store:
 *     entityType: 'store', entityId: '...', field: 'logo'
 *
 *   Upload product image for a listing:
 *     entityType: 'listing', entityId: '...', field: 'media'
 *
 * This way, every uploaded image is immediately connected to its
 * entity — no orphaned files, no manual URL copying.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Which entity types support uploads
export enum EntityType {
  User = 'user',
  Creator = 'creator',
  Store = 'store',
  Listing = 'listing',
  Category = 'category',
}

/**
 * Which fields are valid for each entity type.
 * This map is used for validation — you can't upload a 'logo'
 * to a 'user' entity, for example.
 *
 * SINGLE fields: replace the value (avatar, logo, coverImage, icon, image)
 * ARRAY fields: push to the array (media, featuredWorks)
 */
export const ENTITY_FIELD_MAP: Record<
  string,
  { single: string[]; array: string[] }
> = {
  [EntityType.User]: {
    single: ['avatar'],
    array: [],
  },
  [EntityType.Creator]: {
    single: ['logo', 'coverImage'],
    array: ['featuredWorks'],
  },
  [EntityType.Store]: {
    single: ['logo', 'coverImage'],
    array: [],
  },
  [EntityType.Listing]: {
    single: [],
    array: ['media'],
  },
  [EntityType.Category]: {
    single: ['icon', 'image'],
    array: [],
  },
};

export class UploadMediaDto {
  @ApiProperty({
    enum: EntityType,
    description: 'What entity this image belongs to',
    example: EntityType.Listing,
  })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({
    description: 'The MongoDB ID of the entity',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description:
      'Which field to update on the entity. ' +
      'User: avatar | Creator: logo, coverImage, featuredWorks | ' +
      'Store: logo, coverImage | Listing: media | Category: icon, image',
    example: 'media',
  })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiPropertyOptional({
    enum: ['image', 'video'],
    default: 'image',
    description: 'Media type (only relevant for listing media)',
  })
  @IsString()
  @IsOptional()
  mediaType?: string = 'image';
}

export class DeleteMediaDto {
  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ description: 'Entity MongoDB ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Which field to remove image from',
  })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({
    description:
      'The Cloudinary URL to remove (for array fields like listing media)',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}