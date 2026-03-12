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
exports.DeleteMediaDto = exports.UploadMediaDto = exports.ENTITY_FIELD_MAP = exports.EntityType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var EntityType;
(function (EntityType) {
    EntityType["User"] = "user";
    EntityType["Creator"] = "creator";
    EntityType["Store"] = "store";
    EntityType["Listing"] = "listing";
    EntityType["Category"] = "category";
})(EntityType || (exports.EntityType = EntityType = {}));
exports.ENTITY_FIELD_MAP = {
    [EntityType.User]: {
        single: ['avatar'],
        array: [],
    },
    [EntityType.Creator]: {
        single: ['logo', 'coverImage'],
        array: ['featuredWorks'],
    },
    [EntityType.Store]: {
        single: ['logo', 'coverImage'],
        array: [],
    },
    [EntityType.Listing]: {
        single: [],
        array: ['media'],
    },
    [EntityType.Category]: {
        single: ['icon', 'image'],
        array: [],
    },
};
class UploadMediaDto {
    constructor() {
        this.mediaType = 'image';
    }
}
exports.UploadMediaDto = UploadMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: EntityType,
        description: 'What entity this image belongs to',
        example: EntityType.Listing,
    }),
    (0, class_validator_1.IsEnum)(EntityType),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The MongoDB ID of the entity',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Which field to update on the entity. ' +
            'User: avatar | Creator: logo, coverImage, featuredWorks | ' +
            'Store: logo, coverImage | Listing: media | Category: icon, image',
        example: 'media',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['image', 'video'],
        default: 'image',
        description: 'Media type (only relevant for listing media)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "mediaType", void 0);
class DeleteMediaDto {
}
exports.DeleteMediaDto = DeleteMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EntityType }),
    (0, class_validator_1.IsEnum)(EntityType),
    __metadata("design:type", String)
], DeleteMediaDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity MongoDB ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteMediaDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Which field to remove image from',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteMediaDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The Cloudinary URL to remove (for array fields like listing media)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DeleteMediaDto.prototype, "imageUrl", void 0);
//# sourceMappingURL=media.dto.js.map