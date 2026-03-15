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
exports.DeliveryZonesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const delivery_zone_schema_1 = require("./schemas/delivery-zone.schema");
let DeliveryZonesService = class DeliveryZonesService {
    constructor(zoneModel) {
        this.zoneModel = zoneModel;
    }
    async create(dto) {
        const existing = await this.zoneModel
            .findOne({ name: dto.name, isDeleted: { $ne: true } })
            .exec();
        if (existing) {
            throw new common_1.ConflictException(`Zone "${dto.name}" already exists`);
        }
        return this.zoneModel.create(dto);
    }
    async findAll() {
        return this.zoneModel
            .find({ isDeleted: { $ne: true } })
            .sort({ name: 1 })
            .exec();
    }
    async findActive() {
        return this.zoneModel
            .find({ isActive: true, isDeleted: { $ne: true } })
            .sort({ name: 1 })
            .exec();
    }
    async findById(id) {
        const zone = await this.zoneModel
            .findOne({ _id: id, isDeleted: { $ne: true } })
            .exec();
        if (!zone)
            throw new common_1.NotFoundException('Delivery zone not found');
        return zone;
    }
    async update(id, dto) {
        const zone = await this.zoneModel
            .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, dto, {
            new: true,
        })
            .exec();
        if (!zone)
            throw new common_1.NotFoundException('Delivery zone not found');
        return zone;
    }
    async remove(id) {
        const zone = await this.zoneModel.findById(id).exec();
        if (!zone)
            throw new common_1.NotFoundException('Delivery zone not found');
        zone.isDeleted = true;
        zone.deletedAt = new Date();
        await zone.save();
    }
    async getFeeForState(state) {
        const zone = await this.zoneModel
            .findOne({
            states: { $regex: new RegExp(`^${state}$`, 'i') },
            isActive: true,
            isDeleted: { $ne: true },
        })
            .exec();
        return zone?.baseFee ?? 0;
    }
    async getZoneForState(state) {
        const zone = await this.zoneModel
            .findOne({
            states: { $regex: new RegExp(`^${state}$`, 'i') },
            isActive: true,
            isDeleted: { $ne: true },
        })
            .exec();
        if (!zone)
            return null;
        return { zoneName: zone.name, fee: zone.baseFee };
    }
};
exports.DeliveryZonesService = DeliveryZonesService;
exports.DeliveryZonesService = DeliveryZonesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(delivery_zone_schema_1.DeliveryZone.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DeliveryZonesService);
//# sourceMappingURL=delivery-zones.service.js.map