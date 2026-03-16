/**
 * disputes/dto/dispute.dto.ts - Dispute DTOs
 * =============================================
 * Data shapes for dispute operations.
 *
 * CreateDisputeDto: What a user sends when opening a dispute.
 * UpdateDisputeDto: For admin to update status/resolution/priority.
 * AddDisputeMessageDto: For adding messages to the dispute thread.
 * QueryDisputesDto: For browsing disputes with filters.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';
import {
  DisputeType,
  DisputeStatus,
  DisputePriority,
} from '../schemas/dispute.schema';

// ═══════════════════════════════════════════════════════════════
// CREATE DISPUTE - User opens a dispute
// ═══════════════════════════════════════════════════════════════

export class CreateDisputeDto {
  @ApiProperty({
    enum: DisputeType,
    description: 'Type of dispute',
    example: DisputeType.OrderIssue,
  })
  @IsEnum(DisputeType)
  @IsNotEmpty()
  type: DisputeType;

  @ApiProperty({
    description: 'Brief subject of the dispute',
    example: 'Item not received after 2 weeks',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'I placed an order on March 1st but have not received it yet...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Related order ID (if applicable)',
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Attachment URLs (e.g., screenshots)',
    type: [String],
    example: ['https://res.cloudinary.com/...'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

// ═══════════════════════════════════════════════════════════════
// UPDATE DISPUTE - Admin updates dispute status/resolution
// ═══════════════════════════════════════════════════════════════

export class UpdateDisputeDto {
  @ApiPropertyOptional({
    enum: DisputeStatus,
    description: 'New dispute status',
  })
  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Resolution description',
    example: 'Refund has been processed. Buyer should receive it within 3-5 business days.',
  })
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiPropertyOptional({
    enum: DisputePriority,
    description: 'Dispute priority level',
  })
  @IsEnum(DisputePriority)
  @IsOptional()
  priority?: DisputePriority;

  @ApiPropertyOptional({
    description: 'Admin user ID to assign this dispute to',
  })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

// ═══════════════════════════════════════════════════════════════
// ADD MESSAGE - Add a message to the dispute thread
// ═══════════════════════════════════════════════════════════════

export class AddDisputeMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Can you provide the tracking number for my order?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// QUERY DISPUTES - Filter and paginate disputes
// ═══════════════════════════════════════════════════════════════

export class QueryDisputesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DisputeStatus })
  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;

  @ApiPropertyOptional({ enum: DisputeType })
  @IsEnum(DisputeType)
  @IsOptional()
  type?: DisputeType;

  @ApiPropertyOptional({ enum: DisputePriority })
  @IsEnum(DisputePriority)
  @IsOptional()
  priority?: DisputePriority;
}
