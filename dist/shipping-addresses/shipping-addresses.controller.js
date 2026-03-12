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
exports.ShippingAddressesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const shipping_addresses_service_1 = require("./shipping-addresses.service");
const swagger_1 = require("@nestjs/swagger");
const shipping_addresses_dto_1 = require("./dto/shipping-addresses.dto");
let ShippingAddressesController = class ShippingAddressesController {
    constructor(shippingAddressesService) {
        this.shippingAddressesService = shippingAddressesService;
    }
    async create(req, dto) {
        return this.shippingAddressesService.create(req.user.sub, dto);
    }
    async findAll(req) {
        return this.shippingAddressesService.findAll(req.user.sub);
    }
    async findDefault(req) {
        return this.shippingAddressesService.findDefault(req.user.sub);
    }
    async findOne(req, id) {
        return this.shippingAddressesService.findOne(req.user.sub, id);
    }
    async update(req, id, dto) {
        return this.shippingAddressesService.update(req.user.sub, id, dto);
    }
    async setDefault(req, id) {
        return this.shippingAddressesService.setDefault(req.user.sub, id);
    }
    async remove(req, id) {
        await this.shippingAddressesService.remove(req.user.sub, id);
    }
};
exports.ShippingAddressesController = ShippingAddressesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new shipping address' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shipping_addresses_dto_1.CreateShippingAddressDto]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shipping addresses for current user' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('default'),
    (0, swagger_1.ApiOperation)({ summary: 'Get default shipping address' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "findDefault", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific shipping address' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a shipping address' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, shipping_addresses_dto_1.UpdateShippingAddressDto]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/default'),
    (0, swagger_1.ApiOperation)({ summary: 'Set a shipping address as default' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "setDefault", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a shipping address' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingAddressesController.prototype, "remove", null);
exports.ShippingAddressesController = ShippingAddressesController = __decorate([
    (0, swagger_1.ApiTags)('Shipping Addresses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('shipping-addresses'),
    __metadata("design:paramtypes", [shipping_addresses_service_1.ShippingAddressesService])
], ShippingAddressesController);
//# sourceMappingURL=shipping-addresses.controller.js.map