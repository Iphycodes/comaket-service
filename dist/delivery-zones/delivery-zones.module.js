"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryZonesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const delivery_zones_controller_1 = require("./delivery-zones.controller");
const delivery_zones_service_1 = require("./delivery-zones.service");
const delivery_zone_schema_1 = require("./schemas/delivery-zone.schema");
let DeliveryZonesModule = class DeliveryZonesModule {
};
exports.DeliveryZonesModule = DeliveryZonesModule;
exports.DeliveryZonesModule = DeliveryZonesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: delivery_zone_schema_1.DeliveryZone.name, schema: delivery_zone_schema_1.DeliveryZoneSchema },
            ]),
        ],
        controllers: [delivery_zones_controller_1.DeliveryZonesController],
        providers: [delivery_zones_service_1.DeliveryZonesService],
        exports: [delivery_zones_service_1.DeliveryZonesService],
    })
], DeliveryZonesModule);
//# sourceMappingURL=delivery-zones.module.js.map