"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./media.service");
const user_schema_1 = require("../users/schemas/user.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const categories_schema_1 = require("../categories/schema/categories.schema");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: creator_schema_1.Creator.name, schema: creator_schema_1.CreatorSchema },
                { name: store_schema_1.Store.name, schema: store_schema_1.StoreSchema },
                { name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema },
                { name: categories_schema_1.Category.name, schema: categories_schema_1.CategorySchema },
            ]),
        ],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService],
        exports: [media_service_1.MediaService],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map