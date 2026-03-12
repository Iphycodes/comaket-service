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
exports.AdminCreateListingDto = exports.AdminQueryDto = exports.UpdateUserStatusDto = exports.UpdateStoreStatusDto = exports.UpdateCreatorStatusDto = exports.UpdateUserRoleDto = void 0;
const contants_1 = require("../../config/contants");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateUserRoleDto {
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: contants_1.UserRole }),
    (0, class_validator_1.IsEnum)(contants_1.UserRole),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "role", void 0);
class UpdateCreatorStatusDto {
}
exports.UpdateCreatorStatusDto = UpdateCreatorStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: contants_1.CreatorStatus }),
    (0, class_validator_1.IsEnum)(contants_1.CreatorStatus),
    __metadata("design:type", String)
], UpdateCreatorStatusDto.prototype, "status", void 0);
class UpdateStoreStatusDto {
}
exports.UpdateStoreStatusDto = UpdateStoreStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: contants_1.StoreStatus }),
    (0, class_validator_1.IsEnum)(contants_1.StoreStatus),
    __metadata("design:type", String)
], UpdateStoreStatusDto.prototype, "status", void 0);
class UpdateUserStatusDto {
}
exports.UpdateUserStatusDto = UpdateUserStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['active', 'suspended'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "status", void 0);
class AdminQueryDto {
    constructor() {
        this.page = 1;
        this.perPage = 20;
    }
}
exports.AdminQueryDto = AdminQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AdminQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AdminQueryDto.prototype, "perPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminQueryDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminQueryDto.prototype, "plan", void 0);
class AdminListingPriceDto {
    constructor() {
        this.currency = contants_1.Currency.NGN;
        this.negotiable = false;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1500000,
        description: 'Price in kobo (e.g. 1500000 = ₦15,000)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    __metadata("design:type", Number)
], AdminListingPriceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: contants_1.Currency, default: contants_1.Currency.NGN }),
    (0, class_validator_1.IsEnum)(contants_1.Currency),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminListingPriceDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AdminListingPriceDto.prototype, "negotiable", void 0);
class AdminListingMediaDto {
    constructor() {
        this.type = 'image';
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/product.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminListingMediaDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['image', 'video'], default: 'image' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminListingMediaDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Thumbnail URL for videos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminListingMediaDto.prototype, "thumbnail", void 0);
class AdminListingLocationDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminListingLocationDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminListingLocationDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminListingLocationDto.prototype, "city", void 0);
class AdminCreateListingDto {
    constructor() {
        this.quantity = 1;
    }
}
exports.AdminCreateListingDto = AdminCreateListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Premium Leather Wallet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminCreateListingDto.prototype, "itemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Genuine leather wallet, handcrafted with care.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminCreateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: contants_1.ItemCondition, example: contants_1.ItemCondition.BrandNew }),
    (0, class_validator_1.IsEnum)(contants_1.ItemCondition),
    __metadata("design:type", String)
], AdminCreateListingDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: contants_1.ListingType,
        example: contants_1.ListingType.Consignment,
        description: 'Selling type for the listing',
    }),
    (0, class_validator_1.IsEnum)(contants_1.ListingType),
    __metadata("design:type", String)
], AdminCreateListingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AdminListingPriceDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AdminListingPriceDto),
    __metadata("design:type", AdminListingPriceDto)
], AdminCreateListingDto.prototype, "askingPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [AdminListingMediaDto],
        description: 'At least 1 image required',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AdminListingMediaDto),
    __metadata("design:type", Array)
], AdminCreateListingDto.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'fashion' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminCreateListingDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['leather', 'wallet', 'official'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AdminCreateListingDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AdminCreateListingDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Item location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AdminListingLocationDto),
    __metadata("design:type", AdminListingLocationDto)
], AdminCreateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 2000000,
        description: 'Selling price in kobo (for consignment/direct purchase)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AdminCreateListingDto.prototype, "sellingPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 15,
        description: 'Commission rate percentage (for consignment)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AdminCreateListingDto.prototype, "commissionRate", void 0);
//# sourceMappingURL=admin.dto.js.map