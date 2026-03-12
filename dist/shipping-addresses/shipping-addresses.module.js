"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingAddressesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const shipping_addresses_controller_1 = require("./shipping-addresses.controller");
const shipping_addresses_service_1 = require("./shipping-addresses.service");
const shipping_addresses_schema_1 = require("./schemas/shipping-addresses.schema");
let ShippingAddressesModule = class ShippingAddressesModule {
};
exports.ShippingAddressesModule = ShippingAddressesModule;
exports.ShippingAddressesModule = ShippingAddressesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: shipping_addresses_schema_1.ShippingAddress.name, schema: shipping_addresses_schema_1.ShippingAddressSchema },
            ]),
        ],
        controllers: [shipping_addresses_controller_1.ShippingAddressesController],
        providers: [shipping_addresses_service_1.ShippingAddressesService],
        exports: [shipping_addresses_service_1.ShippingAddressesService],
    })
], ShippingAddressesModule);
//# sourceMappingURL=shipping-addresses.module.js.map