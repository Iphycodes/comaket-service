import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AlertsService } from './alerts.service';
import { GetAlertsDto } from './dto/alert.dto';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts for the current user' })
  @ResponseMessage('Alerts retrieved successfully')
  async getAlerts(@GetUser('sub') userId: string, @Query() dto: GetAlertsDto) {
    return this.alertsService.getAlerts(userId, dto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread alert count' })
  @ResponseMessage('Unread count retrieved')
  async getUnreadCount(@GetUser('sub') userId: string) {
    const count = await this.alertsService.getUnreadCount(userId);
    return { count };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all alerts as read' })
  @ResponseMessage('All alerts marked as read')
  async markAllAsRead(@GetUser('sub') userId: string) {
    const count = await this.alertsService.markAllAsRead(userId);
    return { markedCount: count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single alert as read' })
  @ResponseMessage('Alert marked as read')
  async markAsRead(@Param('id') alertId: string, @GetUser('sub') userId: string) {
    return this.alertsService.markAsRead(alertId, userId);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all alerts (soft delete)' })
  @ResponseMessage('All alerts cleared')
  async clearAll(@GetUser('sub') userId: string) {
    const count = await this.alertsService.clearAllAlerts(userId);
    return { clearedCount: count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single alert' })
  @ResponseMessage('Alert deleted')
  async deleteAlert(@Param('id') alertId: string, @GetUser('sub') userId: string) {
    const deleted = await this.alertsService.deleteAlert(alertId, userId);
    return { deleted };
  }
}
