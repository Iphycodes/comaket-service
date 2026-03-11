/**
 * admin/admin.controller.ts - Admin Endpoints
 * ===============================================
 * ALL endpoints require Admin or SuperAdmin role.
 *
 * DASHBOARD:
 *   GET    /admin/dashboard         → Platform stats overview
 *
 * USERS:
 *   GET    /admin/users             → List all users
 *   PATCH  /admin/users/:id/role    → Change user role
 *
 * CREATORS:
 *   GET    /admin/creators          → List all creators
 *   PATCH  /admin/creators/:id/verify → Add verified badge
 *   PATCH  /admin/creators/:id/status → Suspend/reactivate
 *
 * LISTINGS:
 *   POST   /admin/listings/create  → Create listing (straight to live, Kraft_official store)
 *
 * NOTE: Listing review and order management are handled through
 * their own module endpoints (listings/admin/*, orders/admin/*).
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
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

import { AdminService } from './admin.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { UpdatePlatformSettingsDto } from '../platform-settings/dto/update-settings.dto';

import { UserRole } from '@config/contants';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { AdminCreateListingDto, AdminQueryDto, UpdateCreatorStatusDto, UpdateStoreStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin, UserRole.SuperAdmin)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get platform dashboard stats',
    description:
      'Returns comprehensive platform statistics: users, creators, ' +
      'stores, listings (total/pending/live), orders, revenue breakdown.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get comprehensive platform stats',
    description:
      'Returns detailed counts broken down by status for every entity. ' +
      'Used by admin pages to show metrics without frontend calculation.',
  })
  @ApiResponse({ status: 200, description: 'Comprehensive platform stats' })
  async getStats() {
    return this.adminService.getStats();
  }

  // ═══════════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  @Get('users')
  @ApiOperation({
    summary: 'List all users',
    description: 'Paginated user list with optional role filter and search',
  })
  async listUsers(@Query() query: AdminQueryDto) {
    return this.adminService.listUsers(
      query.page,
      query.perPage,
      query.role,
      query.search,
      query.status,
    );
  }

  @Patch('users/:id/role')
  @ResponseMessage('User role updated')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User MongoDB ID' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto.role);
  }

  @Patch('users/:id/status')
  @ResponseMessage('User status updated')
  @ApiOperation({ summary: 'Suspend or reactivate a user' })
  @ApiParam({ name: 'id', description: 'User MongoDB ID' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto.status);
  }

  // ═══════════════════════════════════════════════════════════
  // CREATOR MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  @Get('creators')
  @ApiOperation({
    summary: 'List all creators',
    description:
      'Paginated creator list with optional status filter and search',
  })
  async listCreators(@Query() query: AdminQueryDto) {
    return this.adminService.listCreators(
      query.page,
      query.perPage,
      query.status,
      query.search,
      query.plan,
    );
  }

  @Patch('creators/:id/verify')
  @ResponseMessage('Creator verified')
  @ApiOperation({
    summary: 'Verify a creator',
    description: 'Adds the verified badge to a creator profile',
  })
  @ApiParam({ name: 'id', description: 'Creator MongoDB ID' })
  async verifyCreator(@Param('id') creatorId: string) {
    return this.adminService.verifyCreator(creatorId);
  }

  @Patch('creators/:id/status')
  @ResponseMessage('Creator status updated')
  @ApiOperation({
    summary: 'Update creator status',
    description: 'Suspend or reactivate a creator',
  })
  @ApiParam({ name: 'id', description: 'Creator MongoDB ID' })
  async updateCreatorStatus(
    @Param('id') creatorId: string,
    @Body() dto: UpdateCreatorStatusDto,
  ) {
    return this.adminService.updateCreatorStatus(creatorId, dto.status);
  }

  // ═══════════════════════════════════════════════════════════
  // STORE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  @Get('stores')
  @ApiOperation({
    summary: 'List all stores',
    description:
      'Paginated store list with optional status filter and search. ' +
      'Unlike public endpoint, shows all stores regardless of visibility.',
  })
  async listStores(@Query() query: AdminQueryDto) {
    return this.adminService.listStores(
      query.page,
      query.perPage,
      query.status,
      query.search,
    );
  }

  @Patch('stores/:id/status')
  @ResponseMessage('Store status updated')
  @ApiOperation({
    summary: 'Update store status',
    description: 'Suspend, activate, or close a store',
  })
  @ApiParam({ name: 'id', description: 'Store MongoDB ID' })
  async updateStoreStatus(
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreStatusDto,
  ) {
    return this.adminService.updateStoreStatus(storeId, dto.status);
  }

  // ═══════════════════════════════════════════════════════════
  // LISTING MANAGEMENT (Admin-created listings)
  // ═══════════════════════════════════════════════════════════

  @Post('listings/create')
  @ResponseMessage('Listing created and live')
  @ApiOperation({
    summary: 'Create a listing under the official Kraft_official store',
    description:
      'Admin-created listings skip the review process and go straight to live status ' +
      'under the Kraft_official store.',
  })
  @ApiResponse({ status: 201, description: 'Listing created and live' })
  async adminCreateListing(
    @Body() dto: AdminCreateListingDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.sub || req.user._id;
    return this.adminService.adminCreateListing(dto, adminUserId);
  }

  // ═══════════════════════════════════════════════════════════
  // REVIEW MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  @Get('reviews')
  @ApiOperation({
    summary: 'List all reviews',
    description:
      'Paginated review list with search. Includes hidden reviews.',
  })
  async listReviews(@Query() query: any) {
    return this.adminService.listReviews(
      query.page ? +query.page : 1,
      query.perPage ? +query.perPage : 20,
      query.search,
      query.anonymous,
      query.creatorId,
      query.storeId,
    );
  }

  @Delete('reviews/:id')
  @ResponseMessage('Review deleted')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review MongoDB ID' })
  async deleteReview(@Param('id') reviewId: string) {
    return this.adminService.deleteReview(reviewId);
  }

  @Post('reviews/bulk-delete')
  @ResponseMessage('Reviews deleted')
  @ApiOperation({ summary: 'Bulk delete reviews' })
  async bulkDeleteReviews(@Body() body: { reviewIds: string[] }) {
    return this.adminService.bulkDeleteReviews(body.reviewIds);
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN MANAGEMENT (Super Admin only for mutations)
  // ═══════════════════════════════════════════════════════════

  @Get('admins')
  @ApiOperation({ summary: 'List all admins' })
  async listAdmins() {
    return this.adminService.listAdmins();
  }

  @Post('admins/invite')
  @Roles(UserRole.SuperAdmin)
  @ResponseMessage('Admin invited')
  @ApiOperation({ summary: 'Invite a new admin by email (super_admin only)' })
  async inviteAdmin(@Body() body: { email: string; role?: string }, @Req() req: any) {
    const role = body.role === 'super_admin' ? UserRole.SuperAdmin : UserRole.Admin;
    return this.adminService.inviteAdmin(body.email, role, req.user.sub || req.user._id);
  }

  @Post('admins/:id/resend-invite')
  @Roles(UserRole.SuperAdmin)
  @ResponseMessage('Invite resent')
  @ApiOperation({ summary: 'Resend invite email to admin' })
  async resendAdminInvite(@Param('id') adminId: string) {
    return this.adminService.resendAdminInvite(adminId);
  }

  @Delete('admins/:id')
  @Roles(UserRole.SuperAdmin)
  @ResponseMessage('Admin removed')
  @ApiOperation({ summary: 'Remove an admin (super_admin only)' })
  async removeAdmin(@Param('id') adminId: string, @Req() req: any) {
    return this.adminService.removeAdmin(adminId, req.user.sub || req.user._id);
  }

  // ═══════════════════════════════════════════════════════════
  // PLATFORM SETTINGS
  // ═══════════════════════════════════════════════════════════

  @Get('settings')
  @ApiOperation({
    summary: 'Get platform settings',
    description:
      'Returns the current platform configuration: fee rates, ' +
      'feature flags, and general settings.',
  })
  @ApiResponse({ status: 200, description: 'Platform settings' })
  async getSettings() {
    return this.platformSettingsService.getSettings();
  }

  @Patch('settings')
  @ResponseMessage('Settings updated')
  @ApiOperation({
    summary: 'Update platform settings',
    description:
      'Partially update platform settings. Only provided fields are changed.',
  })
  async updateSettings(@Body() dto: UpdatePlatformSettingsDto) {
    return this.platformSettingsService.updateSettings(dto);
  }
}