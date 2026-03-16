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
exports.DisputesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const contants_1 = require("../config/contants");
const disputes_service_1 = require("./disputes.service");
const dispute_dto_1 = require("./dto/dispute.dto");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const common_2 = require("@nestjs/common");
let DisputesController = class DisputesController {
    constructor(disputesService) {
        this.disputesService = disputesService;
    }
    async create(user, createDisputeDto) {
        return this.disputesService.create(user.sub, createDisputeDto);
    }
    async findMyDisputes(user, query) {
        return this.disputesService.findMyDisputes(user.sub, query);
    }
    async getStats() {
        return this.disputesService.getStats();
    }
    async findAll(query) {
        return this.disputesService.findAll(query);
    }
    async findOne(user, id) {
        await this.assertOwnerOrAdmin(id, user);
        return this.disputesService.findOne(id);
    }
    async update(id, updateDisputeDto) {
        return this.disputesService.update(id, updateDisputeDto);
    }
    async addMessage(user, id, dto) {
        await this.assertOwnerOrAdmin(id, user);
        return this.disputesService.addMessage(id, user.sub, dto);
    }
    async assertOwnerOrAdmin(disputeId, user) {
        const isAdmin = user.role === contants_1.UserRole.Admin || user.role === contants_1.UserRole.SuperAdmin;
        if (isAdmin)
            return;
        const isOwner = await this.disputesService.isOwner(disputeId, user.sub);
        if (!isOwner) {
            throw new common_2.ForbiddenException('You do not have permission to access this dispute');
        }
    }
};
exports.DisputesController = DisputesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Dispute created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Open a dispute',
        description: 'Creates a new dispute for the authenticated user. ' +
            'Can optionally be linked to an order.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Dispute created with status open',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dispute_dto_1.CreateDisputeDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my disputes',
        description: 'Returns all disputes opened by the authenticated user. ' +
            'Can filter by status, type, and priority.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of user disputes' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dispute_dto_1.QueryDisputesDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "findMyDisputes", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Dispute statistics retrieved'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dispute statistics (Admin)',
        description: 'Returns dispute counts grouped by status for dashboard.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute stats by status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all disputes (Admin)',
        description: 'Returns all disputes on the platform. ' +
            'Can filter by status, type, and priority. Supports search.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of all disputes' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispute_dto_1.QueryDisputesDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dispute details',
        description: 'Returns a single dispute with full details. ' +
            'Must be the dispute owner or an admin.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Dispute updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update dispute (Admin)',
        description: 'Admin can update dispute status, resolution, priority, or assignment.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated dispute' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dispute_dto_1.UpdateDisputeDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Message added successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add message to dispute',
        description: 'Adds a message to the dispute thread. ' +
            'Must be the dispute owner or an admin.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message added to dispute thread' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dispute_dto_1.AddDisputeMessageDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "addMessage", null);
exports.DisputesController = DisputesController = __decorate([
    (0, swagger_1.ApiTags)('disputes'),
    (0, common_1.Controller)('disputes'),
    __metadata("design:paramtypes", [disputes_service_1.DisputesService])
], DisputesController);
//# sourceMappingURL=disputes.controller.js.map