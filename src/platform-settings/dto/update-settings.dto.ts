import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdatePlatformSettingsDto {
  // ─── Fee Settings ──────────────────────────────────────────────

  @ApiProperty({ required: false, description: 'Waive self-listing fees' })
  @IsOptional()
  @IsBoolean()
  freeListing?: boolean;

  @ApiProperty({ required: false, description: 'Waive consignment commissions' })
  @IsOptional()
  @IsBoolean()
  noCommission?: boolean;

  @ApiProperty({ required: false, description: 'Self-listing fee %', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  selfListingFeePercent?: number;

  @ApiProperty({ required: false, description: 'Consignment commission %', example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  consignmentCommissionPercent?: number;

  @ApiProperty({ required: false, description: 'Listing fee cap in kobo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  listingFeeCapKobo?: number;

  @ApiProperty({ required: false, description: 'Consignment commission cap in kobo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consignmentCommissionCapKobo?: number;

  // ─── Feature Flags ─────────────────────────────────────────────

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  selfListingEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  consignmentEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  directSaleEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoApproveVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  // ─── Creator Plan Pricing ─────────────────────────────────────

  @ApiProperty({ required: false, description: 'Starter plan price in kobo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  starterPlanPriceKobo?: number;

  @ApiProperty({ required: false, description: 'Pro plan price in kobo', example: 300000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  proPlanPriceKobo?: number;

  @ApiProperty({ required: false, description: 'Business plan price in kobo', example: 800000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  businessPlanPriceKobo?: number;

  @ApiProperty({ required: false, description: 'Starter plan active' })
  @IsOptional()
  @IsBoolean()
  starterPlanActive?: boolean;

  @ApiProperty({ required: false, description: 'Pro plan active' })
  @IsOptional()
  @IsBoolean()
  proPlanActive?: boolean;

  @ApiProperty({ required: false, description: 'Business plan active' })
  @IsOptional()
  @IsBoolean()
  businessPlanActive?: boolean;

  // ─── General ────────────────────────────────────────────────────

  @ApiProperty({ required: false, description: 'Min listing price in kobo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minListingPriceKobo?: number;

  @ApiProperty({ required: false, description: 'Max images per listing' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxListingImages?: number;

  @ApiProperty({ required: false, description: 'Max hours before auto-complete (return window)' })
  @IsOptional()
  @IsNumber()
  maxReturnHoursBeforeAutoComplete?: number;
}
