import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';
import { FollowTargetType } from '../schema/follows.shema';

export class ToggleFollowDto {
  @ApiProperty({ enum: FollowTargetType, example: 'creator' })
  @IsEnum(FollowTargetType)
  @IsNotEmpty()
  targetType: FollowTargetType;

  @ApiProperty({ example: '65a1b2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  @IsNotEmpty()
  targetId: string;
}

export class CheckFollowDto {
  @ApiProperty({ enum: FollowTargetType, example: 'creator' })
  @IsEnum(FollowTargetType)
  @IsNotEmpty()
  targetType: FollowTargetType;

  @ApiProperty({
    example: ['65a1b2c3d4e5f6a7b8c9d0e1'],
    description: 'Array of target IDs to check follow status for',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  targetIds: string[];
}

export class QueryFollowsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: FollowTargetType })
  @IsEnum(FollowTargetType)
  @IsOptional()
  targetType?: FollowTargetType;

  @ApiPropertyOptional({ description: 'Search followers by name' })
  @IsString()
  @IsOptional()
  search?: string;
}