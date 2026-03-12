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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const follows_service_1 = require("./follows.service");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const follows_dto_1 = require("./dto/follows.dto");
const follows_shema_1 = require("./schema/follows.shema");
let FollowsController = class FollowsController {
    constructor(followsService) {
        this.followsService = followsService;
    }
    async toggle(user, toggleDto) {
        return this.followsService.toggle(user.sub, toggleDto);
    }
    async check(user, checkDto) {
        return this.followsService.check(user.sub, checkDto);
    }
    async findMyFollows(user, queryDto) {
        return this.followsService.findMyFollows(user.sub, queryDto);
    }
    async getCount(user, targetType) {
        const count = await this.followsService.getFollowCount(user.sub, targetType);
        return { count };
    }
    async findFollowers(targetType, targetId, queryDto) {
        return this.followsService.findFollowers(targetType, targetId, queryDto);
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)('toggle'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Follow toggled'),
    (0, swagger_1.ApiOperation)({
        summary: 'Follow or unfollow a creator/store',
        description: 'Toggles follow state. Returns { followed: true/false, totalFollowers }.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Follow state toggled' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Target not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, follows_dto_1.ToggleFollowDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)('check'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check follow status',
        description: 'Check if the current user follows one or more creators/stores. ' +
            'Returns a map of targetId → boolean.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Map of follow statuses' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, follows_dto_1.CheckFollowDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "check", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my follows',
        description: 'Returns all creators/stores the current user follows. ' +
            'Optionally filter by targetType (creator or store).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of follows' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, follows_dto_1.QueryFollowsDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "findMyFollows", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my follow count',
        description: 'Returns total number of creators/stores the user follows.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Follow count' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('targetType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':targetType/:targetId/followers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get followers of a creator or store',
        description: 'Public endpoint. Returns paginated list of followers.',
    }),
    (0, swagger_1.ApiParam)({ name: 'targetType', enum: follows_shema_1.FollowTargetType }),
    (0, swagger_1.ApiParam)({ name: 'targetId', description: 'Creator or Store MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of followers' }),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, follows_dto_1.QueryFollowsDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "findFollowers", null);
exports.FollowsController = FollowsController = __decorate([
    (0, swagger_1.ApiTags)('follows'),
    (0, common_1.Controller)('follows'),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
//# sourceMappingURL=follows.controller.js.map