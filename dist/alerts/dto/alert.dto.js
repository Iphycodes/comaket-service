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
exports.GetAlertsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const contants_1 = require("../../config/contants");
class GetAlertsDto extends pagination_dto_1.PaginationDto {
}
exports.GetAlertsDto = GetAlertsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by read status', enum: ['true', 'false'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetAlertsDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by alert type', enum: contants_1.AlertType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(contants_1.AlertType),
    __metadata("design:type", String)
], GetAlertsDto.prototype, "type", void 0);
//# sourceMappingURL=alert.dto.js.map