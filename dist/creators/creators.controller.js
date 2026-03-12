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
exports.CreatorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const creators_service_1 = require("./creators.service");
const creator_dto_1 = require("./dto/creator.dto");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let CreatorsController = class CreatorsController {
    constructor(creatorsService) {
        this.creatorsService = creatorsService;
    }
    async becomeCreator(user, becomeCreatorDto) {
        return this.creatorsService.becomeCreator(user.sub, becomeCreatorDto);
    }
    async getMyProfile(user) {
        return this.creatorsService.findByUserId(user.sub);
    }
    async updateMyProfile(user, updateCreatorDto) {
        return this.creatorsService.updateProfile(user.sub, updateCreatorDto);
    }
    async updateBankDetails(user, bankDetailsDto) {
        return this.creatorsService.updateBankDetails(user.sub, bankDetailsDto);
    }
    async findAll(queryDto) {
        return this.creatorsService.findAll(queryDto);
    }
    async checkUsername(username) {
        return this.creatorsService.checkUsername(username);
    }
    async findBySlug(slug) {
        return this.creatorsService.findBySlug(slug);
    }
};
exports.CreatorsController = CreatorsController;
__decorate([
    (0, common_1.Post)('become'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Creator profile created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Become a creator',
        description: 'Upgrades a regular user to a creator. Creates a creator profile ' +
            'and updates the user role. Starts on the free Starter plan.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Creator profile created' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User is already a creator' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.BecomeCreatorDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "becomeCreator", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my creator profile',
        description: "Returns the authenticated user's creator profile",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Creator profile retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User is not a creator' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Creator profile updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update my creator profile',
        description: "Updates the authenticated user's creator profile",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.UpdateCreatorDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Patch)('me/bank'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Bank details updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update my bank details',
        description: 'Updates bank account info for receiving payouts',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank details updated' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.BankDetailsDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "updateBankDetails", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Browse creators',
        description: 'List and search creators on the marketplace. ' +
            'Supports filtering by status, plan, category, and text search.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of creators' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [creator_dto_1.QueryCreatorsDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('check-username'),
    (0, response_message_decorator_1.ResponseMessage)('Username availability checked'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check username availability',
        description: 'Returns whether a username is available for a new creator profile.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ available: true | false }' }),
    __param(0, (0, common_1.Body)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'View creator profile by slug',
        description: "Returns a creator's public profile. Use the slug from the URL " +
            '(e.g., "johns-craft-studio")',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Creator profile' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Creator not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "findBySlug", null);
exports.CreatorsController = CreatorsController = __decorate([
    (0, swagger_1.ApiTags)('creators'),
    (0, common_1.Controller)('creators'),
    __metadata("design:paramtypes", [creators_service_1.CreatorsService])
], CreatorsController);
//# sourceMappingURL=creators.controller.js.map