import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AlertType } from '../../config/contants';

export class GetAlertsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by read status', enum: ['true', 'false'] })
  @IsOptional()
  @IsString()
  isRead?: string;

  @ApiPropertyOptional({ description: 'Filter by alert type', enum: AlertType })
  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;
}
