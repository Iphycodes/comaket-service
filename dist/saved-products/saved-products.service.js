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
var SavedProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const saved_product_schema_1 = require("./schema/saved-product.schema");
let SavedProductsService = SavedProductsService_1 = class SavedProductsService {
    constructor(savedProductModel, listingModel) {
        this.savedProductModel = savedProductModel;
        this.listingModel = listingModel;
        this.logger = new common_1.Logger(SavedProductsService_1.name);
    }
    async toggle(userId, listingId) {
        const listing = await this.listingModel.findById(listingId);
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        const existing = await this.savedProductModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            listingId: new mongoose_2.Types.ObjectId(listingId),
        });
        if (existing) {
            await this.savedProductModel.deleteOne({ _id: existing._id });
            return { saved: false, message: 'Listing removed from saved items' };
        }
        await this.savedProductModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            listingId: new mongoose_2.Types.ObjectId(listingId),
        });
        return { saved: true, message: 'Listing saved' };
    }
    async getSavedProducts(userId, page = 1, perPage = 20) {
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.savedProductModel
                .find({ userId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .populate({
                path: 'listingId',
                populate: {
                    path: 'storeId',
                    select: 'name slug logo',
                },
            })
                .lean(),
            this.savedProductModel.countDocuments({
                userId: new mongoose_2.Types.ObjectId(userId),
            }),
        ]);
        const validItems = items.filter((item) => item.listingId != null);
        return {
            items: validItems.map((item) => ({
                _id: item._id,
                savedAt: item.createdAt,
                listing: item.listingId,
            })),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async checkSavedStatus(userId, listingIds) {
        const saved = await this.savedProductModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            listingId: { $in: listingIds.map((id) => new mongoose_2.Types.ObjectId(id)) },
        })
            .select('listingId')
            .lean();
        const savedSet = new Set(saved.map((s) => s.listingId.toString()));
        return listingIds.reduce((acc, id) => {
            acc[id] = savedSet.has(id);
            return acc;
        }, {});
    }
    async getSavedCount(userId) {
        const count = await this.savedProductModel.countDocuments({
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        return { count };
    }
    async remove(userId, listingId) {
        const result = await this.savedProductModel.deleteOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            listingId: new mongoose_2.Types.ObjectId(listingId),
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Saved item not found');
        }
        return { message: 'Listing removed from saved items' };
    }
};
exports.SavedProductsService = SavedProductsService;
exports.SavedProductsService = SavedProductsService = SavedProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(saved_product_schema_1.SavedProduct.name)),
    __param(1, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SavedProductsService);
//# sourceMappingURL=saved-products.service.js.map