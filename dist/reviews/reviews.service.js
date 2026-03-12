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
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./schemas/review.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const stores_service_1 = require("../stores/stores.service");
const creators_service_1 = require("../creators/creators.service");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    constructor(reviewModel, orderModel, userModel, storeModel, creatorModel, storesService, creatorsService) {
        this.reviewModel = reviewModel;
        this.orderModel = orderModel;
        this.userModel = userModel;
        this.storeModel = storeModel;
        this.creatorModel = creatorModel;
        this.storesService = storesService;
        this.creatorsService = creatorsService;
        this.logger = new common_1.Logger(ReviewsService_1.name);
    }
    async create(reviewerId, createDto) {
        const { creatorId, storeId, listingId, orderId, rating, comment, reviewerName, } = createDto;
        if (!creatorId && !storeId && !listingId && !orderId) {
            throw new common_1.BadRequestException('At least one target is required: creatorId, storeId, listingId, or orderId');
        }
        if (creatorId) {
            const creator = await this.creatorModel
                .findById(creatorId)
                .select('_id')
                .lean()
                .exec();
            if (!creator)
                throw new common_1.NotFoundException('Creator not found');
        }
        if (storeId) {
            const store = await this.storeModel
                .findById(storeId)
                .select('_id')
                .lean()
                .exec();
            if (!store)
                throw new common_1.NotFoundException('Store not found');
        }
        if (orderId) {
            const order = await this.orderModel
                .findById(orderId)
                .select('_id')
                .lean()
                .exec();
            if (!order)
                throw new common_1.NotFoundException('Order not found');
        }
        let displayName = reviewerName || 'Anonymous';
        if (reviewerId) {
            const user = (await this.userModel
                .findById(reviewerId)
                .select('firstName lastName')
                .lean()
                .exec());
            if (user) {
                displayName = `${user.firstName} ${user.lastName}`;
            }
        }
        const review = new this.reviewModel({
            reviewerId: reviewerId ? new mongoose_2.Types.ObjectId(reviewerId) : null,
            reviewerName: displayName,
            creatorId: creatorId ? new mongoose_2.Types.ObjectId(creatorId) : null,
            storeId: storeId ? new mongoose_2.Types.ObjectId(storeId) : null,
            listingId: listingId ? new mongoose_2.Types.ObjectId(listingId) : null,
            orderId: orderId ? new mongoose_2.Types.ObjectId(orderId) : null,
            rating,
            comment,
        });
        const savedReview = await review.save();
        if (storeId) {
            await this.updateStoreRating(storeId);
        }
        if (creatorId) {
            await this.updateCreatorRating(creatorId);
        }
        return savedReview;
    }
    async sellerReply(reviewId, sellerId, replyDto) {
        const review = await this.reviewModel.findById(reviewId).exec();
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        let isOwner = false;
        if (review.storeId) {
            const store = await this.storeModel
                .findById(review.storeId)
                .select('userId')
                .lean()
                .exec();
            if (store && store.userId.toString() === sellerId) {
                isOwner = true;
            }
        }
        if (!isOwner && review.creatorId) {
            const creator = await this.creatorModel
                .findById(review.creatorId)
                .select('userId')
                .lean()
                .exec();
            if (creator && creator.userId.toString() === sellerId) {
                isOwner = true;
            }
        }
        if (!isOwner) {
            throw new common_1.BadRequestException('You can only reply to reviews on your own store or profile');
        }
        review.sellerReply = replyDto.reply;
        review.sellerReplyAt = new Date();
        return review.save();
    }
    async findAll(queryDto) {
        const { page, perPage, listingId, storeId, creatorId, orderId } = queryDto;
        const filter = { isVisible: true };
        if (listingId)
            filter.listingId = new mongoose_2.Types.ObjectId(listingId);
        if (storeId)
            filter.storeId = new mongoose_2.Types.ObjectId(storeId);
        if (creatorId)
            filter.creatorId = new mongoose_2.Types.ObjectId(creatorId);
        if (orderId)
            filter.orderId = new mongoose_2.Types.ObjectId(orderId);
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.reviewModel
                .find(filter)
                .populate('reviewerId', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .exec(),
            this.reviewModel.countDocuments(filter).exec(),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async updateStoreRating(storeId) {
        const result = await this.reviewModel.aggregate([
            { $match: { storeId: new mongoose_2.Types.ObjectId(storeId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        const stats = result[0] || { avgRating: 0, totalReviews: 0 };
        const avgRating = Math.round(stats.avgRating * 10) / 10;
        await this.storeModel
            .findByIdAndUpdate(storeId, {
            $set: { rating: avgRating, totalReviews: stats.totalReviews },
        })
            .exec();
    }
    async updateCreatorRating(creatorId) {
        const result = await this.reviewModel.aggregate([
            { $match: { creatorId: new mongoose_2.Types.ObjectId(creatorId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        const stats = result[0] || { avgRating: 0, totalReviews: 0 };
        const avgRating = Math.round(stats.avgRating * 10) / 10;
        await this.creatorModel
            .findByIdAndUpdate(creatorId, {
            $set: { rating: avgRating, totalReviews: stats.totalReviews },
        })
            .exec();
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(1, (0, mongoose_1.InjectModel)('Order')),
    __param(2, (0, mongoose_1.InjectModel)('User')),
    __param(3, (0, mongoose_1.InjectModel)(store_schema_1.Store.name)),
    __param(4, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        stores_service_1.StoresService,
        creators_service_1.CreatorsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map