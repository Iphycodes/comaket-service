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
exports.QueryCreatorsDto = exports.UpdateCreatorDto = exports.BecomeCreatorDto = exports.BankDetailsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const contants_1 = require("../../config/contants");
class SocialLinksDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'emeka_tech' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SocialLinksDto.prototype, "instagram", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'emeka_tech' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SocialLinksDto.prototype, "twitter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'emeka_tech' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SocialLinksDto.prototype, "facebook", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '@emeka_tech' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SocialLinksDto.prototype, "tiktok", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '@emeka_tech' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SocialLinksDto.prototype, "youtube", void 0);
class BankDetailsDto {
}
exports.BankDetailsDto = BankDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Guaranty Trust Bank' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '058' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0123456789' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emeka Okafor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "accountName", void 0);
class CreatorLocationDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Nigeria' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatorLocationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Lagos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatorLocationDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ikeja' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatorLocationDto.prototype, "city", void 0);
class BecomeCreatorDto {
}
exports.BecomeCreatorDto = BecomeCreatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'emeka_tech',
        description: 'Unique username / display handle',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Emeka',
        description: 'First name (updates the User record)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Okafor',
        description: 'Last name (updates the User record)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Tech enthusiast selling quality electronics across Nigeria.',
        description: 'Short bio / about me',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'contact@emeka.ng',
        description: 'Public contact email (can differ from account email)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2348012345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2348012345678',
        description: 'WhatsApp number for customer contact',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "whatsappNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://emeka.ng',
        description: 'Personal or portfolio website',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: SocialLinksDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SocialLinksDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", SocialLinksDto)
], BecomeCreatorDto.prototype, "socialLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://res.cloudinary.com/comaket/image/upload/v1/photo.jpg',
        description: 'Profile image URL',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "profileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['Electronics', 'Phones'],
        description: 'Industries / niches the creator operates in',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], BecomeCreatorDto.prototype, "industries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { country: 'Nigeria', state: 'Lagos', city: 'Ikeja' },
        description: 'Creator location',
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreatorLocationDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreatorLocationDto)
], BecomeCreatorDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['tailor', 'ankara', 'bespoke', 'ready-to-wear'],
        description: 'Searchable tags/keywords based on selected industries',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], BecomeCreatorDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'starter',
        description: 'Plan ID — starter, pro, or business',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BecomeCreatorDto.prototype, "planId", void 0);
class UpdateCreatorDto extends (0, swagger_1.PartialType)(BecomeCreatorDto) {
}
exports.UpdateCreatorDto = UpdateCreatorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/cover.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCreatorDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['https://example.com/work1.jpg', 'https://example.com/work2.jpg'],
        description: 'Portfolio/showcase images (Pro and Business plans)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCreatorDto.prototype, "featuredWorks", void 0);
class QueryCreatorsDto extends pagination_dto_1.PaginationDto {
}
exports.QueryCreatorsDto = QueryCreatorsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: contants_1.CreatorStatus,
        description: 'Filter by creator status',
    }),
    (0, class_validator_1.IsEnum)(contants_1.CreatorStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCreatorsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: contants_1.CreatorPlan,
        description: 'Filter by subscription plan',
    }),
    (0, class_validator_1.IsEnum)(contants_1.CreatorPlan),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCreatorsDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Electronics',
        description: 'Filter by industry',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCreatorsDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Lagos',
        description: 'Filter by state (location.state)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCreatorsDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Ikeja',
        description: 'Filter by city (location.city)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCreatorsDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Only show verified creators',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QueryCreatorsDto.prototype, "isVerified", void 0);
//# sourceMappingURL=creator.dto.js.map