"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cart_controller_1 = require("./cart.controller");
const cart_service_1 = require("./cart.service");
const cart_schema_1 = require("./schema/cart.schema");
const checkout_session_schema_1 = require("./schema/checkout-session.schema");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const orders_module_1 = require("../orders/orders.module");
const payments_module_1 = require("../payments/payments.module");
let CartModule = class CartModule {
};
exports.CartModule = CartModule;
exports.CartModule = CartModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: cart_schema_1.Cart.name, schema: cart_schema_1.CartSchema },
                { name: checkout_session_schema_1.CheckoutSession.name, schema: checkout_session_schema_1.CheckoutSessionSchema },
                { name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema },
            ]),
            orders_module_1.OrdersModule,
            (0, common_1.forwardRef)(() => payments_module_1.PaymentsModule),
        ],
        controllers: [cart_controller_1.CartController],
        providers: [cart_service_1.CartService],
        exports: [cart_service_1.CartService],
    })
], CartModule);
//# sourceMappingURL=cart.module.js.map