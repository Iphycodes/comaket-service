"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedWorksModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const featured_works_controller_1 = require("./featured-works.controller");
const featured_works_service_1 = require("./featured-works.service");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
const featured_works_schema_1 = require("./schema/featured-works.schema");
let FeaturedWorksModule = class FeaturedWorksModule {
};
exports.FeaturedWorksModule = FeaturedWorksModule;
exports.FeaturedWorksModule = FeaturedWorksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: featured_works_schema_1.FeaturedWork.name, schema: featured_works_schema_1.FeaturedWorkSchema },
                { name: creator_schema_1.Creator.name, schema: creator_schema_1.CreatorSchema },
                { name: store_schema_1.Store.name, schema: store_schema_1.StoreSchema },
            ]),
        ],
        controllers: [featured_works_controller_1.FeaturedWorksController],
        providers: [featured_works_service_1.FeaturedWorksService],
        exports: [featured_works_service_1.FeaturedWorksService],
    })
], FeaturedWorksModule);
//# sourceMappingURL=featured-works.module.js.map