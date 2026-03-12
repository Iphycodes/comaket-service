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
var ShippingAddressesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingAddressesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shipping_addresses_schema_1 = require("./schemas/shipping-addresses.schema");
let ShippingAddressesService = ShippingAddressesService_1 = class ShippingAddressesService {
    constructor(shippingAddressModel) {
        this.shippingAddressModel = shippingAddressModel;
        this.logger = new common_1.Logger(ShippingAddressesService_1.name);
    }
    async create(userId, dto) {
        if (dto.isDefault) {
            await this.shippingAddressModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId), isDefault: true }, { $set: { isDefault: false } });
        }
        const count = await this.shippingAddressModel.countDocuments({
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        const address = new this.shippingAddressModel({
            ...dto,
            userId: new mongoose_2.Types.ObjectId(userId),
            isDefault: dto.isDefault || count === 0,
        });
        return address.save();
    }
    async findAll(userId) {
        return this.shippingAddressModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ isDefault: -1, createdAt: -1 })
            .exec();
    }
    async findOne(userId, addressId) {
        const address = await this.shippingAddressModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(addressId),
            userId: new mongoose_2.Types.ObjectId(userId),
        })
            .exec();
        if (!address) {
            throw new common_1.NotFoundException('Shipping address not found');
        }
        return address;
    }
    async findDefault(userId) {
        return this.shippingAddressModel
            .findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            isDefault: true,
        })
            .exec();
    }
    async update(userId, addressId, dto) {
        const address = await this.findOne(userId, addressId);
        if (dto.isDefault) {
            await this.shippingAddressModel.updateMany({
                userId: new mongoose_2.Types.ObjectId(userId),
                isDefault: true,
                _id: { $ne: new mongoose_2.Types.ObjectId(addressId) },
            }, { $set: { isDefault: false } });
        }
        Object.assign(address, dto);
        return address.save();
    }
    async setDefault(userId, addressId) {
        await this.findOne(userId, addressId);
        await this.shippingAddressModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId) }, { $set: { isDefault: false } });
        return this.shippingAddressModel
            .findByIdAndUpdate(addressId, { isDefault: true }, { new: true })
            .exec();
    }
    async remove(userId, addressId) {
        const address = await this.findOne(userId, addressId);
        const wasDefault = address.isDefault;
        await this.shippingAddressModel.deleteOne({ _id: address._id });
        if (wasDefault) {
            const next = await this.shippingAddressModel
                .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .exec();
            if (next) {
                next.isDefault = true;
                await next.save();
            }
        }
    }
};
exports.ShippingAddressesService = ShippingAddressesService;
exports.ShippingAddressesService = ShippingAddressesService = ShippingAddressesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(shipping_addresses_schema_1.ShippingAddress.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ShippingAddressesService);
//# sourceMappingURL=shipping-addresses.service.js.map