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
exports.FeaturedWorksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const featured_works_service_1 = require("./featured-works.service");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const featured_works_dto_1 = require("./dto/featured-works.dto");
const featured_works_schema_1 = require("./schema/featured-works.schema");
let FeaturedWorksController = class FeaturedWorksController {
    constructor(featuredWorksService) {
        this.featuredWorksService = featuredWorksService;
    }
    async create(user, dto) {
        return this.featuredWorksService.create(user.sub, dto);
    }
    async reorder(user, dto) {
        return this.featuredWorksService.reorder(user.sub, dto);
    }
    async update(user, workId, dto) {
        return this.featuredWorksService.update(user.sub, workId, dto);
    }
    async removeAll(user, ownerType, ownerId) {
        return this.featuredWorksService.removeAll(user.sub, ownerType, ownerId);
    }
    async remove(user, workId) {
        return this.featuredWorksService.remove(user.sub, workId);
    }
    async count(ownerType, ownerId) {
        return this.featuredWorksService.countByOwner(ownerType, ownerId);
    }
    async findByOwner(queryDto) {
        return this.featuredWorksService.findByOwner(queryDto);
    }
    async findById(workId) {
        return this.featuredWorksService.findById(workId);
    }
};
exports.FeaturedWorksController = FeaturedWorksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Featured work added'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add a featured work',
        description: 'Adds a new portfolio/showcase item to a creator or store profile. ' +
            'Enforces plan limits: Starter = 0, Pro = 10, Business = 25.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Featured work created' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Plan limit reached or not available',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Creator/Store not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, featured_works_dto_1.CreateFeaturedWorkDto]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Featured works reordered'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reorder featured works',
        description: 'Send an array of featured work IDs in the desired display order. ' +
            'Positions will be updated to match the array order.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reordered list returned' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, featured_works_dto_1.ReorderFeaturedWorksDto]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Featured work updated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a featured work',
        description: 'Update the title, description, or image URL of a featured work.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Featured work ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated work returned' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Work not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, featured_works_dto_1.UpdateFeaturedWorkDto]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('owner/:ownerType/:ownerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('All featured works deleted'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete all featured works for an owner',
        description: 'Removes all featured works from a creator or store profile.',
    }),
    (0, swagger_1.ApiParam)({ name: 'ownerType', enum: featured_works_schema_1.FeaturedWorkOwnerType }),
    (0, swagger_1.ApiParam)({ name: 'ownerId', description: 'Creator or Store ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ deletedCount }' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('ownerType')),
    __param(2, (0, common_1.Param)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "removeAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Featured work deleted'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a featured work',
        description: 'Removes a single featured work and shifts remaining positions.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Featured work ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ deleted: true }' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Work not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get featured works count and limit',
        description: 'Returns current count, plan limit, and plan name for a creator or store. ' +
            'Useful for showing "3/10 featured works" in the UI.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ count, limit, plan }' }),
    __param(0, (0, common_1.Query)('ownerType')),
    __param(1, (0, common_1.Query)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "count", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get featured works by owner',
        description: 'Returns paginated featured works for a creator or store, sorted by position. ' +
            'Pass ownerType and ownerId as query params.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of featured works' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [featured_works_dto_1.QueryFeaturedWorksDto]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "findByOwner", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a single featured work',
        description: 'Returns a featured work by its ID.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Featured work ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured work object' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeaturedWorksController.prototype, "findById", null);
exports.FeaturedWorksController = FeaturedWorksController = __decorate([
    (0, swagger_1.ApiTags)('featured-works'),
    (0, common_1.Controller)('featured-works'),
    __metadata("design:paramtypes", [featured_works_service_1.FeaturedWorksService])
], FeaturedWorksController);
//# sourceMappingURL=featured-works.controller.js.map