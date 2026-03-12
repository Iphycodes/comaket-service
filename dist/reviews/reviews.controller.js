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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const reviews_service_1 = require("./reviews.service");
const review_dto_1 = require("./dto/review.dto");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt.auth.guard");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async create(req, createDto) {
        const reviewerId = req.user?.sub || null;
        return this.reviewsService.create(reviewerId, createDto);
    }
    async sellerReply(reviewId, user, replyDto) {
        return this.reviewsService.sellerReply(reviewId, user.sub, replyDto);
    }
    async findAll(queryDto) {
        return this.reviewsService.findAll(queryDto);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Review submitted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Leave a review',
        description: 'Submit a review for a creator, store, listing, or order. ' +
            'At least one target (creatorId, storeId, listingId, orderId) is required. ' +
            'Auth is optional — anonymous reviews are supported.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Review created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No target provided' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/reply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Reply added successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reply to a review (seller/creator)',
        description: 'Sellers and creators can reply to reviews on their store or profile.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Review MongoDB ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_dto_1.SellerReplyDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "sellerReply", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Browse reviews',
        description: 'Get reviews filtered by listing, store, creator, or order. ' +
            'Used on listing detail pages, store pages, and creator profiles.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated reviews' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_dto_1.QueryReviewsDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findAll", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('reviews'),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map