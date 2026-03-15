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
exports.DeliveryZonesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const delivery_zones_service_1 = require("./delivery-zones.service");
const delivery_zone_dto_1 = require("./dto/delivery-zone.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const contants_1 = require("../config/contants");
let DeliveryZonesController = class DeliveryZonesController {
    constructor(zonesService) {
        this.zonesService = zonesService;
    }
    async getActiveZones() {
        return this.zonesService.findActive();
    }
    async getFeeForState(state) {
        const result = await this.zonesService.getZoneForState(state);
        return result || { zoneName: null, fee: 0 };
    }
    async getAllZones() {
        return this.zonesService.findAll();
    }
    async create(dto) {
        return this.zonesService.create(dto);
    }
    async update(id, dto) {
        return this.zonesService.update(id, dto);
    }
    async remove(id) {
        return this.zonesService.remove(id);
    }
};
exports.DeliveryZonesController = DeliveryZonesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active delivery zones' }),
    (0, response_message_decorator_1.ResponseMessage)('Delivery zones retrieved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryZonesController.prototype, "getActiveZones", null);
__decorate([
    (0, common_1.Get)('fee'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery fee for a state' }),
    (0, response_message_decorator_1.ResponseMessage)('Delivery fee retrieved'),
    __param(0, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryZonesController.prototype, "getFeeForState", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all delivery zones (including inactive)' }),
    (0, response_message_decorator_1.ResponseMessage)('All delivery zones retrieved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryZonesController.prototype, "getAllZones", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create delivery zone' }),
    (0, response_message_decorator_1.ResponseMessage)('Delivery zone created'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delivery_zone_dto_1.CreateDeliveryZoneDto]),
    __metadata("design:returntype", Promise)
], DeliveryZonesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update delivery zone' }),
    (0, response_message_decorator_1.ResponseMessage)('Delivery zone updated'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, delivery_zone_dto_1.UpdateDeliveryZoneDto]),
    __metadata("design:returntype", Promise)
], DeliveryZonesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete delivery zone' }),
    (0, response_message_decorator_1.ResponseMessage)('Delivery zone deleted'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryZonesController.prototype, "remove", null);
exports.DeliveryZonesController = DeliveryZonesController = __decorate([
    (0, swagger_1.ApiTags)('Delivery Zones'),
    (0, common_1.Controller)('delivery-zones'),
    __metadata("design:paramtypes", [delivery_zones_service_1.DeliveryZonesService])
], DeliveryZonesController);
//# sourceMappingURL=delivery-zones.controller.js.map