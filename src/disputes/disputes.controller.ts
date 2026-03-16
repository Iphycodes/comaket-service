/**
 * disputes/disputes.controller.ts - Dispute Endpoints
 * ======================================================
 * Two perspectives on disputes:
 *
 * USER:
 *   POST   /disputes              -> Open a dispute
 *   GET    /disputes/me           -> My disputes
 *   GET    /disputes/:id          -> View dispute details
 *   POST   /disputes/:id/messages -> Add message to dispute
 *
 * ADMIN:
 *   GET    /disputes              -> All disputes
 *   GET    /disputes/stats        -> Dispute statistics
 *   PATCH  /disputes/:id          -> Update dispute
 *   POST   /disputes/:id/messages -> Add message to dispute
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { UserRole } from '@config/contants';
import { DisputesService } from './disputes.service';
import {
  CreateDisputeDto,
  UpdateDisputeDto,
  AddDisputeMessageDto,
  QueryDisputesDto,
} from './dto/dispute.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('disputes')
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  // ═══════════════════════════════════════════════════════════
  // USER ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/disputes ────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Dispute created successfully')
  @ApiOperation({
    summary: 'Open a dispute',
    description:
      'Creates a new dispute for the authenticated user. ' +
      'Can optionally be linked to an order.',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispute created with status open',
  })
  async create(
    @GetUser() user: JwtPayload,
    @Body() createDisputeDto: CreateDisputeDto,
  ) {
    return this.disputesService.create(user.sub, createDisputeDto);
  }

  // ─── GET /api/v1/disputes/me ──────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my disputes',
    description:
      'Returns all disputes opened by the authenticated user. ' +
      'Can filter by status, type, and priority.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of user disputes' })
  async findMyDisputes(
    @GetUser() user: JwtPayload,
    @Query() query: QueryDisputesDto,
  ) {
    return this.disputesService.findMyDisputes(user.sub, query);
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/disputes/stats ───────────────────────────

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Dispute statistics retrieved')
  @ApiOperation({
    summary: 'Get dispute statistics (Admin)',
    description: 'Returns dispute counts grouped by status for dashboard.',
  })
  @ApiResponse({ status: 200, description: 'Dispute stats by status' })
  async getStats() {
    return this.disputesService.getStats();
  }

  // ─── GET /api/v1/disputes ─────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all disputes (Admin)',
    description:
      'Returns all disputes on the platform. ' +
      'Can filter by status, type, and priority. Supports search.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of all disputes' })
  async findAll(@Query() query: QueryDisputesDto) {
    return this.disputesService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════
  // SHARED ENDPOINTS (User or Admin)
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/disputes/:id ─────────────────────────────

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get dispute details',
    description:
      'Returns a single dispute with full details. ' +
      'Must be the dispute owner or an admin.',
  })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({ status: 200, description: 'Dispute details' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async findOne(
    @GetUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.assertOwnerOrAdmin(id, user);
    return this.disputesService.findOne(id);
  }

  // ─── PATCH /api/v1/disputes/:id ───────────────────────────

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Dispute updated successfully')
  @ApiOperation({
    summary: 'Update dispute (Admin)',
    description:
      'Admin can update dispute status, resolution, priority, or assignment.',
  })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({ status: 200, description: 'Updated dispute' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDisputeDto: UpdateDisputeDto,
  ) {
    return this.disputesService.update(id, updateDisputeDto);
  }

  // ─── POST /api/v1/disputes/:id/messages ───────────────────

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Message added successfully')
  @ApiOperation({
    summary: 'Add message to dispute',
    description:
      'Adds a message to the dispute thread. ' +
      'Must be the dispute owner or an admin.',
  })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({ status: 201, description: 'Message added to dispute thread' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async addMessage(
    @GetUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddDisputeMessageDto,
  ) {
    await this.assertOwnerOrAdmin(id, user);
    return this.disputesService.addMessage(id, user.sub, dto);
  }

  // ─── Access Control Helper ────────────────────────────────

  /**
   * Ensures the requester is either the dispute owner or an admin.
   * Throws ForbiddenException if neither.
   */
  private async assertOwnerOrAdmin(
    disputeId: string,
    user: JwtPayload,
  ): Promise<void> {
    const isAdmin =
      user.role === UserRole.Admin || user.role === UserRole.SuperAdmin;

    if (isAdmin) return;

    const isOwner = await this.disputesService.isOwner(disputeId, user.sub);

    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to access this dispute',
      );
    }
  }
}
