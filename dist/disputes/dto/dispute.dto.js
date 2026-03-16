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
exports.QueryDisputesDto = exports.AddDisputeMessageDto = exports.UpdateDisputeDto = exports.CreateDisputeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const dispute_schema_1 = require("../schemas/dispute.schema");
class CreateDisputeDto {
}
exports.CreateDisputeDto = CreateDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: dispute_schema_1.DisputeType,
        description: 'Type of dispute',
        example: dispute_schema_1.DisputeType.OrderIssue,
    }),
    (0, class_validator_1.IsEnum)(dispute_schema_1.DisputeType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Brief subject of the dispute',
        example: 'Item not received after 2 weeks',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed description of the issue',
        example: 'I placed an order on March 1st but have not received it yet...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Related order ID (if applicable)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Attachment URLs (e.g., screenshots)',
        type: [String],
        example: ['https://res.cloudinary.com/...'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDisputeDto.prototype, "attachments", void 0);
class UpdateDisputeDto {
}
exports.UpdateDisputeDto = UpdateDisputeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: dispute_schema_1.DisputeStatus,
        description: 'New dispute status',
    }),
    (0, class_validator_1.IsEnum)(dispute_schema_1.DisputeStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Resolution description',
        example: 'Refund has been processed. Buyer should receive it within 3-5 business days.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "resolution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: dispute_schema_1.DisputePriority,
        description: 'Dispute priority level',
    }),
    (0, class_validator_1.IsEnum)(dispute_schema_1.DisputePriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Admin user ID to assign this dispute to',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "assignedTo", void 0);
class AddDisputeMessageDto {
}
exports.AddDisputeMessageDto = AddDisputeMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message content',
        example: 'Can you provide the tracking number for my order?',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddDisputeMessageDto.prototype, "message", void 0);
class QueryDisputesDto extends pagination_dto_1.PaginationDto {
}
exports.QueryDisputesDto = QueryDisputesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: dispute_schema_1.DisputeStatus }),
    (0, class_validator_1.IsEnum)(dispute_schema_1.DisputeStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: dispute_schema_1.DisputeType }),
    (0, class_validator_1.IsEnum)(dispute_schema_1.DisputeType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: dispute_schema_1.DisputePriority }),
    (0, class_validator_1.IsEnum)(dispute_schema_1.DisputePriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryDisputesDto.prototype, "priority", void 0);
//# sourceMappingURL=dispute.dto.js.map