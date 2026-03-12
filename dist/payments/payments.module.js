"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const orders_module_1 = require("../orders/orders.module");
const cart_module_1 = require("../cart/cart.module");
const platform_settings_module_1 = require("../platform-settings/platform-settings.module");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            orders_module_1.OrdersModule,
            (0, common_1.forwardRef)(() => cart_module_1.CartModule),
            platform_settings_module_1.PlatformSettingsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema },
                { name: creator_schema_1.Creator.name, schema: creator_schema_1.CreatorSchema },
            ]),
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [payments_service_1.PaymentsService],
        exports: [payments_service_1.PaymentsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map