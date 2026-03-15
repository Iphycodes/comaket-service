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
exports.UpdateDeliveryZoneDto = exports.CreateDeliveryZoneDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateDeliveryZoneDto {
}
exports.CreateDeliveryZoneDto = CreateDeliveryZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Zone name', example: 'Lagos' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'States covered by this zone',
        example: ['Lagos'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDeliveryZoneDto.prototype, "states", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base delivery fee in kobo', example: 150000 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryZoneDto.prototype, "baseFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Zone description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryZoneDto.prototype, "description", void 0);
class UpdateDeliveryZoneDto {
}
exports.UpdateDeliveryZoneDto = UpdateDeliveryZoneDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Zone name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeliveryZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'States covered by this zone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateDeliveryZoneDto.prototype, "states", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Base delivery fee in kobo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliveryZoneDto.prototype, "baseFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether zone is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateDeliveryZoneDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Zone description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeliveryZoneDto.prototype, "description", void 0);
//# sourceMappingURL=delivery-zone.dto.js.map