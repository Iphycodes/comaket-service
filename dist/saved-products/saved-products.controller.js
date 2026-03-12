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
exports.SavedProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const saved_products_service_1 = require("./saved-products.service");
const saved_product_dto_1 = require("./dto/saved-product.dto");
let SavedProductsController = class SavedProductsController {
    constructor(savedProductsService) {
        this.savedProductsService = savedProductsService;
    }
    async toggle(req, dto) {
        return this.savedProductsService.toggle(req.user.sub, dto.listingId);
    }
    async checkSavedStatus(req, listingIds) {
        return this.savedProductsService.checkSavedStatus(req.user.sub, listingIds);
    }
    async getSavedProducts(req, query) {
        return this.savedProductsService.getSavedProducts(req.user.sub, query.page, query.perPage);
    }
    async getSavedCount(req) {
        return this.savedProductsService.getSavedCount(req.user.sub);
    }
    async remove(req, listingId) {
        return this.savedProductsService.remove(req.user.sub, listingId);
    }
};
exports.SavedProductsController = SavedProductsController;
__decorate([
    (0, common_1.Post)('toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle save/unsave a listing' }),
    (0, response_message_decorator_1.ResponseMessage)('Success'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, saved_product_dto_1.SaveProductDto]),
    __metadata("design:returntype", Promise)
], SavedProductsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)('check'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if listings are saved',
        description: 'Pass an array of listing IDs, returns a map of { listingId: boolean }',
    }),
    (0, response_message_decorator_1.ResponseMessage)('Success'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('listingIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], SavedProductsController.prototype, "checkSavedStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my saved products (paginated)' }),
    (0, response_message_decorator_1.ResponseMessage)('Success'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, saved_product_dto_1.QuerySavedProductsDto]),
    __metadata("design:returntype", Promise)
], SavedProductsController.prototype, "getSavedProducts", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get saved items count' }),
    (0, response_message_decorator_1.ResponseMessage)('Success'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SavedProductsController.prototype, "getSavedCount", null);
__decorate([
    (0, common_1.Delete)(':listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a listing from saved items' }),
    (0, response_message_decorator_1.ResponseMessage)('Listing removed from saved items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SavedProductsController.prototype, "remove", null);
exports.SavedProductsController = SavedProductsController = __decorate([
    (0, swagger_1.ApiTags)('Saved Products (Wishlist)'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('saved-products'),
    __metadata("design:paramtypes", [saved_products_service_1.SavedProductsService])
], SavedProductsController);
//# sourceMappingURL=saved-products.controller.js.map