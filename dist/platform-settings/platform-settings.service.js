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
exports.PlatformSettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const platform_settings_schema_1 = require("./schemas/platform-settings.schema");
let PlatformSettingsService = class PlatformSettingsService {
    constructor(settingsModel, configService) {
        this.settingsModel = settingsModel;
        this.configService = configService;
    }
    async getSettings() {
        let settings = await this.settingsModel
            .findOneAndUpdate({ key: 'platform' }, { $setOnInsert: { key: 'platform' } }, { upsert: true, new: true })
            .exec();
        if (!settings) {
            settings = await this.settingsModel.findOne({ key: 'platform' }).exec();
            if (!settings) {
                settings = await this.settingsModel.create({ key: 'platform' });
            }
        }
        return settings;
    }
    async updateSettings(updates) {
        const { key, ...safeUpdates } = updates;
        const settings = await this.settingsModel
            .findOneAndUpdate({ key: 'platform' }, { $set: safeUpdates }, { upsert: true, new: true, runValidators: true })
            .exec();
        return settings;
    }
    async isFreeListing() {
        const settings = await this.getSettings();
        return settings.freeListing;
    }
    async isNoCommission() {
        const settings = await this.getSettings();
        return settings.noCommission;
    }
    async getSelfListingFeePercent() {
        const settings = await this.getSettings();
        return settings.selfListingFeePercent;
    }
    async getListingFeeCapKobo() {
        const settings = await this.getSettings();
        return settings.listingFeeCapKobo;
    }
    async getConsignmentCommissionPercent() {
        const settings = await this.getSettings();
        return settings.consignmentCommissionPercent;
    }
    async getPlanPricing() {
        const settings = await this.getSettings();
        return {
            starter: settings.starterPlanPriceKobo,
            pro: settings.proPlanPriceKobo,
            business: settings.businessPlanPriceKobo,
        };
    }
    async getActivePlans() {
        const settings = await this.getSettings();
        return {
            starter: settings.starterPlanActive,
            pro: settings.proPlanActive,
            business: settings.businessPlanActive,
        };
    }
    async getPublicSettings() {
        const settings = await this.getSettings();
        return {
            plans: [
                { id: 'starter', priceKobo: settings.starterPlanPriceKobo, active: settings.starterPlanActive },
                { id: 'pro', priceKobo: settings.proPlanPriceKobo, active: settings.proPlanActive },
                { id: 'business', priceKobo: settings.businessPlanPriceKobo, active: settings.businessPlanActive },
            ],
            featureFlags: {
                selfListingEnabled: settings.selfListingEnabled,
                consignmentEnabled: settings.consignmentEnabled,
                directSaleEnabled: settings.directSaleEnabled,
                maintenanceMode: settings.maintenanceMode,
            },
        };
    }
};
exports.PlatformSettingsService = PlatformSettingsService;
exports.PlatformSettingsService = PlatformSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(platform_settings_schema_1.PlatformSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], PlatformSettingsService);
//# sourceMappingURL=platform-settings.service.js.map