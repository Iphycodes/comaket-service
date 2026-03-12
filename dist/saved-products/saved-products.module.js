"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedProductsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const saved_products_controller_1 = require("./saved-products.controller");
const saved_products_service_1 = require("./saved-products.service");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const saved_product_schema_1 = require("./schema/saved-product.schema");
let SavedProductsModule = class SavedProductsModule {
};
exports.SavedProductsModule = SavedProductsModule;
exports.SavedProductsModule = SavedProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: saved_product_schema_1.SavedProduct.name, schema: saved_product_schema_1.SavedProductSchema },
                { name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema },
            ]),
        ],
        controllers: [saved_products_controller_1.SavedProductsController],
        providers: [saved_products_service_1.SavedProductsService],
        exports: [saved_products_service_1.SavedProductsService],
    })
], SavedProductsModule);
//# sourceMappingURL=saved-products.module.js.map