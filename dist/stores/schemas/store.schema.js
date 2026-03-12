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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreSchema = exports.Store = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const contants_1 = require("../../config/contants");
const base_schema_1 = require("../../common/schemas/base-schema");
class OperatingHours {
}
class StoreLocation {
}
let Store = class Store extends base_schema_1.BaseSchema {
};
exports.Store = Store;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Creator', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Store.prototype, "creatorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Store.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Store.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Store.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "logo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "coverImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "tagline", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "website", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            instagram: String,
            twitter: String,
            facebook: String,
            tiktok: String,
            youtube: String,
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Store.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "whatsappNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
        },
        default: {},
    }),
    __metadata("design:type", StoreLocation)
], Store.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Store.prototype, "categories", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Store.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Store.prototype, "featuredWorks", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            bankName: String,
            bankCode: String,
            accountNumber: String,
            accountName: String,
        },
        default: null,
    }),
    __metadata("design:type", Object)
], Store.prototype, "bankDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            monday: String,
            tuesday: String,
            wednesday: String,
            thursday: String,
            friday: String,
            saturday: String,
            sunday: String,
        },
        default: {},
    }),
    __metadata("design:type", OperatingHours)
], Store.prototype, "operatingHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Store.prototype, "returnPolicy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            newOrder: { type: Boolean, default: true },
            newReview: { type: Boolean, default: true },
            lowStock: { type: Boolean, default: true },
            promotions: { type: Boolean, default: false },
        },
        default: {
            newOrder: true,
            newReview: true,
            lowStock: true,
            promotions: false,
        },
    }),
    __metadata("design:type", Object)
], Store.prototype, "notifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(contants_1.StoreStatus),
        default: contants_1.StoreStatus.Active,
    }),
    __metadata("design:type", String)
], Store.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Store.prototype, "isVisible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Store.prototype, "totalListings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Store.prototype, "totalSales", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Store.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Store.prototype, "totalReviews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Store.prototype, "followers", void 0);
exports.Store = Store = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })
], Store);
exports.StoreSchema = mongoose_1.SchemaFactory.createForClass(Store);
exports.StoreSchema.index({ creatorId: 1 });
exports.StoreSchema.index({ userId: 1 });
exports.StoreSchema.index({ slug: 1 }, { unique: true });
exports.StoreSchema.index({ status: 1 });
exports.StoreSchema.index({ categories: 1 });
exports.StoreSchema.index({ 'location.state': 1 });
exports.StoreSchema.index({ 'location.city': 1 });
exports.StoreSchema.index({ name: 'text', description: 'text' });
//# sourceMappingURL=store.schema.js.map