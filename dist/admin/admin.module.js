"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const user_schema_1 = require("../users/schemas/user.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
const review_schema_1 = require("../reviews/schemas/review.schema");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const users_module_1 = require("../users/users.module");
const creators_module_1 = require("../creators/creators.module");
const stores_module_1 = require("../stores/stores.module");
const listings_module_1 = require("../listings/listings.module");
const orders_module_1 = require("../orders/orders.module");
const platform_settings_module_1 = require("../platform-settings/platform-settings.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: creator_schema_1.Creator.name, schema: creator_schema_1.CreatorSchema },
                { name: store_schema_1.Store.name, schema: store_schema_1.StoreSchema },
                { name: review_schema_1.Review.name, schema: review_schema_1.ReviewSchema },
                { name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema },
            ]),
            users_module_1.UsersModule,
            creators_module_1.CreatorsModule,
            stores_module_1.StoresModule,
            listings_module_1.ListingsModule,
            orders_module_1.OrdersModule,
            platform_settings_module_1.PlatformSettingsModule,
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map