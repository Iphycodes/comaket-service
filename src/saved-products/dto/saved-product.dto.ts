import { IsMongoId, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SaveProductDto {
  @ApiProperty({
    description: 'Listing ID to save',
    example: '65e5f6a7b8c9d0e1f2a3b4c5',
  })
  @IsMongoId()
  listingId: string;
}

export class QuerySavedProductsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  perPage?: number = 20;
}