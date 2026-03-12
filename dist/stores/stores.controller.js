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
exports.StoresController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const stores_service_1 = require("./stores.service");
const store_dto_1 = require("./dto/store.dto");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let StoresController = class StoresController {
    constructor(storesService) {
        this.storesService = storesService;
    }
    async create(user, createStoreDto) {
        return this.storesService.create(user.sub, createStoreDto);
    }
    async findMyStores(user) {
        return this.storesService.findMyStores(user.sub);
    }
    async update(storeId, user, updateStoreDto) {
        return this.storesService.update(storeId, user.sub, updateStoreDto);
    }
    async toggleVisibility(storeId, user) {
        return this.storesService.toggleVisibility(storeId, user.sub);
    }
    async closeStore(storeId, user) {
        return this.storesService.closeStore(storeId, user.sub);
    }
    async findAll(queryDto) {
        return this.storesService.findAll(queryDto);
    }
    async findByCreator(creatorId) {
        return this.storesService.findByCreatorId(creatorId);
    }
    async findById(storeId) {
        return this.storesService.findById(storeId);
    }
    async findBySlug(slug) {
        return this.storesService.findBySlug(slug);
    }
};
exports.StoresController = StoresController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Store created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new store',
        description: "Creates a store under the authenticated creator's profile. " +
            'Enforces plan-based limits: Starter = 1 store, Pro = 3, Business = unlimited.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Store created' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Store limit reached for current plan',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User is not a creator' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, store_dto_1.CreateStoreDto]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'List my stores',
        description: 'Returns all stores belonging to the authenticated creator',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of creator's stores" }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "findMyStores", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Store updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update my store',
        description: 'Updates a store. Only the store owner can do this.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Store MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Store updated' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the store owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, store_dto_1.UpdateStoreDto]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/visibility'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Store visibility updated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Toggle store visibility',
        description: 'Hide or show your store on the marketplace. ' +
            "Hidden stores and their listings won't appear in search or browse.",
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Store MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Visibility toggled' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the store owner' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "toggleVisibility", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Store closed successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Close my store',
        description: 'Closes a store (soft close). The store and its data remain in the ' +
            'database but become inactive. Only the store owner can do this.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Store MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Store closed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the store owner' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "closeStore", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Browse stores',
        description: 'List and search stores on the marketplace. ' +
            'Supports filtering by category, creator, and text search.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of stores' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [store_dto_1.QueryStoresDto]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-creator/:creatorId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get stores by creator',
        description: 'Returns all active stores belonging to a specific creator. ' +
            "Used on the creator's public profile page.",
    }),
    (0, swagger_1.ApiParam)({ name: 'creatorId', description: 'Creator MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of creator's stores" }),
    __param(0, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "findByCreator", null);
__decorate([
    (0, common_1.Get)('id/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'View store by ID',
        description: "Returns a store's public profile by its MongoDB ID.",
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Store MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Store details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'View store by slug',
        description: "Returns a store's public profile by its URL slug. " +
            'e.g., /stores/johns-clothing',
    }),
    (0, swagger_1.ApiParam)({ name: 'slug', example: 'johns-clothing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Store details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "findBySlug", null);
exports.StoresController = StoresController = __decorate([
    (0, swagger_1.ApiTags)('stores'),
    (0, common_1.Controller)('stores'),
    __metadata("design:paramtypes", [stores_service_1.StoresService])
], StoresController);
//# sourceMappingURL=stores.controller.js.map