"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const listings_controller_1 = require("./listings.controller");
const listings_service_1 = require("./listings.service");
const stores_module_1 = require("../stores/stores.module");
const creators_module_1 = require("../creators/creators.module");
const platform_settings_module_1 = require("../platform-settings/platform-settings.module");
const listing_schema_1 = require("./schemas/listing.schema");
let ListingsModule = class ListingsModule {
};
exports.ListingsModule = ListingsModule;
exports.ListingsModule = ListingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema }]),
            stores_module_1.StoresModule,
            creators_module_1.CreatorsModule,
            platform_settings_module_1.PlatformSettingsModule,
        ],
        controllers: [listings_controller_1.ListingsController],
        providers: [listings_service_1.ListingsService],
        exports: [listings_service_1.ListingsService],
    })
], ListingsModule);
//# sourceMappingURL=listings.module.js.map