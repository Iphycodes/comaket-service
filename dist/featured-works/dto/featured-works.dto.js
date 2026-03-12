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
exports.QueryFeaturedWorksDto = exports.ReorderFeaturedWorksDto = exports.UpdateFeaturedWorkDto = exports.CreateFeaturedWorkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const featured_works_schema_1 = require("../schema/featured-works.schema");
class CreateFeaturedWorkDto {
}
exports.CreateFeaturedWorkDto = CreateFeaturedWorkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: featured_works_schema_1.FeaturedWorkOwnerType, example: 'creator' }),
    (0, class_validator_1.IsEnum)(featured_works_schema_1.FeaturedWorkOwnerType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFeaturedWorkDto.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '65a1b2c3d4e5f6a7b8c9d0e1',
        description: 'Creator or Store ID',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFeaturedWorkDto.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            'https://res.cloudinary.com/comaket/image/upload/v1/work1.jpg',
            'https://res.cloudinary.com/comaket/image/upload/v1/work2.jpg',
        ],
        description: 'Array of image URLs (at least 1)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateFeaturedWorkDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Custom Built Gaming PC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFeaturedWorkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Built for a client — RTX 4090, 64GB RAM.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFeaturedWorkDto.prototype, "description", void 0);
class UpdateFeaturedWorkDto {
}
exports.UpdateFeaturedWorkDto = UpdateFeaturedWorkDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['https://res.cloudinary.com/comaket/image/upload/v1/new1.jpg'],
        description: 'Replace entire images array',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateFeaturedWorkDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['https://res.cloudinary.com/comaket/image/upload/v1/extra.jpg'],
        description: 'Add images to the existing array',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateFeaturedWorkDto.prototype, "addImages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['https://res.cloudinary.com/comaket/image/upload/v1/old.jpg'],
        description: 'Remove specific images from the array',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateFeaturedWorkDto.prototype, "removeImages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated Title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeaturedWorkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeaturedWorkDto.prototype, "description", void 0);
class ReorderFeaturedWorksDto {
}
exports.ReorderFeaturedWorksDto = ReorderFeaturedWorksDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: featured_works_schema_1.FeaturedWorkOwnerType, example: 'creator' }),
    (0, class_validator_1.IsEnum)(featured_works_schema_1.FeaturedWorkOwnerType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReorderFeaturedWorksDto.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65a1b2c3d4e5f6a7b8c9d0e1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReorderFeaturedWorksDto.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['id3', 'id1', 'id2'],
        description: 'Array of featured work IDs in desired display order',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], ReorderFeaturedWorksDto.prototype, "orderedIds", void 0);
class QueryFeaturedWorksDto extends pagination_dto_1.PaginationDto {
}
exports.QueryFeaturedWorksDto = QueryFeaturedWorksDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: featured_works_schema_1.FeaturedWorkOwnerType, example: 'creator' }),
    (0, class_validator_1.IsEnum)(featured_works_schema_1.FeaturedWorkOwnerType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QueryFeaturedWorksDto.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65a1b2c3d4e5f6a7b8c9d0e1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QueryFeaturedWorksDto.prototype, "ownerId", void 0);
//# sourceMappingURL=featured-works.dto.js.map