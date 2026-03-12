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
exports.QueryFollowsDto = exports.CheckFollowDto = exports.ToggleFollowDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const follows_shema_1 = require("../schema/follows.shema");
class ToggleFollowDto {
}
exports.ToggleFollowDto = ToggleFollowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: follows_shema_1.FollowTargetType, example: 'creator' }),
    (0, class_validator_1.IsEnum)(follows_shema_1.FollowTargetType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleFollowDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65a1b2c3d4e5f6a7b8c9d0e1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleFollowDto.prototype, "targetId", void 0);
class CheckFollowDto {
}
exports.CheckFollowDto = CheckFollowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: follows_shema_1.FollowTargetType, example: 'creator' }),
    (0, class_validator_1.IsEnum)(follows_shema_1.FollowTargetType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CheckFollowDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['65a1b2c3d4e5f6a7b8c9d0e1'],
        description: 'Array of target IDs to check follow status for',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CheckFollowDto.prototype, "targetIds", void 0);
class QueryFollowsDto extends pagination_dto_1.PaginationDto {
}
exports.QueryFollowsDto = QueryFollowsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: follows_shema_1.FollowTargetType }),
    (0, class_validator_1.IsEnum)(follows_shema_1.FollowTargetType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryFollowsDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search followers by name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryFollowsDto.prototype, "search", void 0);
//# sourceMappingURL=follows.dto.js.map