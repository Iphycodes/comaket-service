"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const admin_service_1 = require("./admin.service");
const platform_settings_service_1 = require("../platform-settings/platform-settings.service");
const update_settings_dto_1 = require("../platform-settings/dto/update-settings.dto");
const contants_1 = require("../config/contants");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    constructor(adminService, platformSettingsService) {
        this.adminService = adminService;
        this.platformSettingsService = platformSettingsService;
    }
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }
    async getStats() {
        return this.adminService.getStats();
    }
    async listUsers(query) {
        return this.adminService.listUsers(query.page, query.perPage, query.role, query.search, query.status);
    }
    async updateUserRole(userId, dto) {
        return this.adminService.updateUserRole(userId, dto.role);
    }
    async updateUserStatus(userId, dto) {
        return this.adminService.updateUserStatus(userId, dto.status);
    }
    async listCreators(query) {
        return this.adminService.listCreators(query.page, query.perPage, query.status, query.search, query.plan);
    }
    async verifyCreator(creatorId) {
        return this.adminService.verifyCreator(creatorId);
    }
    async updateCreatorStatus(creatorId, dto) {
        return this.adminService.updateCreatorStatus(creatorId, dto.status);
    }
    async listStores(query) {
        return this.adminService.listStores(query.page, query.perPage, query.status, query.search);
    }
    async updateStoreStatus(storeId, dto) {
        return this.adminService.updateStoreStatus(storeId, dto.status);
    }
    async adminCreateListing(dto, req) {
        const adminUserId = req.user.sub || req.user._id;
        return this.adminService.adminCreateListing(dto, adminUserId);
    }
    async listReviews(query) {
        return this.adminService.listReviews(query.page ? +query.page : 1, query.perPage ? +query.perPage : 20, query.search, query.anonymous, query.creatorId, query.storeId);
    }
    async deleteReview(reviewId) {
        return this.adminService.deleteReview(reviewId);
    }
    async bulkDeleteReviews(body) {
        return this.adminService.bulkDeleteReviews(body.reviewIds);
    }
    async listAdmins() {
        return this.adminService.listAdmins();
    }
    async inviteAdmin(body, req) {
        const role = body.role === 'super_admin' ? contants_1.UserRole.SuperAdmin : contants_1.UserRole.Admin;
        return this.adminService.inviteAdmin(body.email, role, req.user.sub || req.user._id);
    }
    async resendAdminInvite(adminId) {
        return this.adminService.resendAdminInvite(adminId);
    }
    async removeAdmin(adminId, req) {
        return this.adminService.removeAdmin(adminId, req.user.sub || req.user._id);
    }
    async getSettings() {
        return this.platformSettingsService.getSettings();
    }
    async updateSettings(dto) {
        return this.platformSettingsService.updateSettings(dto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get platform dashboard stats',
        description: 'Returns comprehensive platform statistics: users, creators, ' +
            'stores, listings (total/pending/live), orders, revenue breakdown.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get comprehensive platform stats',
        description: 'Returns detailed counts broken down by status for every entity. ' +
            'Used by admin pages to show metrics without frontend calculation.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comprehensive platform stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all users',
        description: 'Paginated user list with optional role filter and search',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AdminQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    (0, response_message_decorator_1.ResponseMessage)('User role updated'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    (0, response_message_decorator_1.ResponseMessage)('User status updated'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend or reactivate a user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Get)('creators'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all creators',
        description: 'Paginated creator list with optional status filter and search',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AdminQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listCreators", null);
__decorate([
    (0, common_1.Patch)('creators/:id/verify'),
    (0, response_message_decorator_1.ResponseMessage)('Creator verified'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a creator',
        description: 'Adds the verified badge to a creator profile',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Creator MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyCreator", null);
__decorate([
    (0, common_1.Patch)('creators/:id/status'),
    (0, response_message_decorator_1.ResponseMessage)('Creator status updated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update creator status',
        description: 'Suspend or reactivate a creator',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Creator MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateCreatorStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCreatorStatus", null);
__decorate([
    (0, common_1.Get)('stores'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all stores',
        description: 'Paginated store list with optional status filter and search. ' +
            'Unlike public endpoint, shows all stores regardless of visibility.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AdminQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listStores", null);
__decorate([
    (0, common_1.Patch)('stores/:id/status'),
    (0, response_message_decorator_1.ResponseMessage)('Store status updated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update store status',
        description: 'Suspend, activate, or close a store',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Store MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateStoreStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateStoreStatus", null);
__decorate([
    (0, common_1.Post)('listings/create'),
    (0, response_message_decorator_1.ResponseMessage)('Listing created and live'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a listing under the official Kraft_official store',
        description: 'Admin-created listings skip the review process and go straight to live status ' +
            'under the Kraft_official store.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Listing created and live' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AdminCreateListingDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminCreateListing", null);
__decorate([
    (0, common_1.Get)('reviews'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all reviews',
        description: 'Paginated review list with search. Includes hidden reviews.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listReviews", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    (0, response_message_decorator_1.ResponseMessage)('Review deleted'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a review' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Review MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Post)('reviews/bulk-delete'),
    (0, response_message_decorator_1.ResponseMessage)('Reviews deleted'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete reviews' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkDeleteReviews", null);
__decorate([
    (0, common_1.Get)('admins'),
    (0, swagger_1.ApiOperation)({ summary: 'List all admins' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listAdmins", null);
__decorate([
    (0, common_1.Post)('admins/invite'),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.SuperAdmin),
    (0, response_message_decorator_1.ResponseMessage)('Admin invited'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a new admin by email (super_admin only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "inviteAdmin", null);
__decorate([
    (0, common_1.Post)('admins/:id/resend-invite'),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.SuperAdmin),
    (0, response_message_decorator_1.ResponseMessage)('Invite resent'),
    (0, swagger_1.ApiOperation)({ summary: 'Resend invite email to admin' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resendAdminInvite", null);
__decorate([
    (0, common_1.Delete)('admins/:id'),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.SuperAdmin),
    (0, response_message_decorator_1.ResponseMessage)('Admin removed'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an admin (super_admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeAdmin", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get platform settings',
        description: 'Returns the current platform configuration: fee rates, ' +
            'feature flags, and general settings.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Platform settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, response_message_decorator_1.ResponseMessage)('Settings updated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update platform settings',
        description: 'Partially update platform settings. Only provided fields are changed.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdatePlatformSettingsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSettings", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        platform_settings_service_1.PlatformSettingsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map