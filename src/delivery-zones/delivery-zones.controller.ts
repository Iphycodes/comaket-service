import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryZonesService } from './delivery-zones.service';
import {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
} from './dto/delivery-zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@config/contants';

@ApiTags('Delivery Zones')
@Controller('delivery-zones')
export class DeliveryZonesController {
  constructor(private readonly zonesService: DeliveryZonesService) {}

  // ─── Public: Get active zones ────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all active delivery zones' })
  @ResponseMessage('Delivery zones retrieved')
  async getActiveZones() {
    return this.zonesService.findActive();
  }

  @Get('fee')
  @ApiOperation({ summary: 'Get delivery fee for a state' })
  @ResponseMessage('Delivery fee retrieved')
  async getFeeForState(@Query('state') state: string) {
    const result = await this.zonesService.getZoneForState(state);
    return result || { zoneName: null, fee: 0 };
  }

  // ─── Admin: CRUD ─────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all delivery zones (including inactive)' })
  @ResponseMessage('All delivery zones retrieved')
  async getAllZones() {
    return this.zonesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create delivery zone' })
  @ResponseMessage('Delivery zone created')
  async create(@Body() dto: CreateDeliveryZoneDto) {
    return this.zonesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update delivery zone' })
  @ResponseMessage('Delivery zone updated')
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryZoneDto) {
    return this.zonesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete delivery zone' })
  @ResponseMessage('Delivery zone deleted')
  async remove(@Param('id') id: string) {
    return this.zonesService.remove(id);
  }
}
