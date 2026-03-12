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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_settings_service_1 = require("./platform-settings.service");
let PlatformSettingsController = class PlatformSettingsController {
    constructor(platformSettingsService) {
        this.platformSettingsService = platformSettingsService;
    }
    async getPublicSettings() {
        return this.platformSettingsService.getPublicSettings();
    }
};
exports.PlatformSettingsController = PlatformSettingsController;
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get public platform settings',
        description: 'Returns plan pricing, active plans, and feature flags. ' +
            'No authentication required.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public platform settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformSettingsController.prototype, "getPublicSettings", null);
exports.PlatformSettingsController = PlatformSettingsController = __decorate([
    (0, swagger_1.ApiTags)('platform'),
    (0, common_1.Controller)('platform'),
    __metadata("design:paramtypes", [platform_settings_service_1.PlatformSettingsService])
], PlatformSettingsController);
//# sourceMappingURL=platform-settings.controller.js.map