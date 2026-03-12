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
exports.CreatorSchema = exports.Creator = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_schema_1 = require("../../common/schemas/base-schema");
const contants_1 = require("../../config/contants");
class SocialLinks {
}
class BankDetails {
}
let Creator = class Creator extends base_schema_1.BaseSchema {
};
exports.Creator = Creator;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Creator.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], Creator.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Creator.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "profileImageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "coverImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "contactEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "whatsappNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "website", void 0);
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
    __metadata("design:type", SocialLinks)
], Creator.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Creator.prototype, "industries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Creator.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            country: String,
            state: String,
            city: String,
        },
        default: null,
    }),
    __metadata("design:type", Object)
], Creator.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Creator.prototype, "featuredWorks", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(contants_1.CreatorPlan),
        default: contants_1.CreatorPlan.Starter,
    }),
    __metadata("design:type", String)
], Creator.prototype, "plan", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "paystackSubscriptionCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "paystackCustomerCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "paystackEmailToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'cancelled', 'expired', 'none'],
        default: 'none',
    }),
    __metadata("design:type", String)
], Creator.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Creator.prototype, "planStartedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Creator.prototype, "planExpiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "planAmountPaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "planPaymentReference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Creator.prototype, "planPaymentChannel", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(contants_1.CreatorStatus),
        default: contants_1.CreatorStatus.Active,
    }),
    __metadata("design:type", String)
], Creator.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Creator.prototype, "isVerified", void 0);
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
    __metadata("design:type", BankDetails)
], Creator.prototype, "bankDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "totalStores", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "totalListings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "totalSales", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "totalReviews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Creator.prototype, "totalFollowers", void 0);
exports.Creator = Creator = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })
], Creator);
exports.CreatorSchema = mongoose_1.SchemaFactory.createForClass(Creator);
exports.CreatorSchema.index({ userId: 1 }, { unique: true });
exports.CreatorSchema.index({ slug: 1 }, { unique: true });
exports.CreatorSchema.index({ username: 1 }, { unique: true });
exports.CreatorSchema.index({ status: 1 });
exports.CreatorSchema.index({ plan: 1 });
exports.CreatorSchema.index({ industries: 1 });
exports.CreatorSchema.index({ tags: 1 });
exports.CreatorSchema.index({ 'location.state': 1 });
exports.CreatorSchema.index({ 'location.city': 1 });
exports.CreatorSchema.index({ username: 'text', bio: 'text' });
//# sourceMappingURL=creator.schema.js.map