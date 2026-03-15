import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDeliveryZoneDto {
  @ApiProperty({ description: 'Zone name', example: 'Lagos' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'States covered by this zone',
    example: ['Lagos'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  states: string[];

  @ApiProperty({ description: 'Base delivery fee in kobo', example: 150000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baseFee: number;

  @ApiPropertyOptional({ description: 'Zone description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDeliveryZoneDto {
  @ApiPropertyOptional({ description: 'Zone name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'States covered by this zone' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @ApiPropertyOptional({ description: 'Base delivery fee in kobo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baseFee?: number;

  @ApiPropertyOptional({ description: 'Whether zone is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Zone description' })
  @IsOptional()
  @IsString()
  description?: string;
}
