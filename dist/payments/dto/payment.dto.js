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
exports.ChangePlanDto = exports.InitializeSubscriptionDto = exports.InitializeListingFeeDto = exports.InitializePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InitializePaymentDto {
}
exports.InitializePaymentDto = InitializePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Order ID to pay for',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to redirect to after payment (overrides default)',
        example: 'https://comaket.com/orders/confirmation',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "callbackUrl", void 0);
class InitializeListingFeeDto {
}
exports.InitializeListingFeeDto = InitializeListingFeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing ID to pay the listing fee for',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializeListingFeeDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to redirect to after payment',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitializeListingFeeDto.prototype, "callbackUrl", void 0);
class InitializeSubscriptionDto {
}
exports.InitializeSubscriptionDto = InitializeSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Plan to subscribe to',
        enum: ['pro', 'business'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializeSubscriptionDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to redirect to after payment',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitializeSubscriptionDto.prototype, "callbackUrl", void 0);
class ChangePlanDto {
}
exports.ChangePlanDto = ChangePlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target plan to switch to',
        enum: ['starter', 'pro', 'business'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePlanDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to redirect to after payment (for upgrades)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChangePlanDto.prototype, "callbackUrl", void 0);
//# sourceMappingURL=payment.dto.js.map