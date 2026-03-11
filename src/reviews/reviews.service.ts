/**
 * reviews/reviews.service.ts - Review Business Logic
 * =====================================================
 * Flexible review system:
 *   - Review a creator, store, listing, or order (at least one target required)
 *   - Logged-in users get their name attached; anonymous users get "Anonymous"
 *   - Rating aggregation updates the target's average rating
 */

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { StoresService } from '../stores/stores.service';
import { CreatorsService } from '../creators/creators.service';
import {
  CreateReviewDto,
  SellerReplyDto,
  QueryReviewsDto,
} from './dto/review.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel('Order') private orderModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    private storesService: StoresService,
    private creatorsService: CreatorsService,
  ) {}

  // ─── Create Review ───────────────────────────────────────

  /**
   * Create a review on a creator, store, listing, or order.
   * At least one target must be provided.
   * reviewerId is null for anonymous reviews.
   */
  async create(
    reviewerId: string | null,
    createDto: CreateReviewDto,
  ): Promise<ReviewDocument> {
    const {
      creatorId,
      storeId,
      listingId,
      orderId,
      rating,
      comment,
      reviewerName,
    } = createDto;

    // At least one target must be provided
    if (!creatorId && !storeId && !listingId && !orderId) {
      throw new BadRequestException(
        'At least one target is required: creatorId, storeId, listingId, or orderId',
      );
    }

    // Verify targets exist
    if (creatorId) {
      const creator = await this.creatorModel
        .findById(creatorId)
        .select('_id')
        .lean()
        .exec();
      if (!creator) throw new NotFoundException('Creator not found');
    }
    if (storeId) {
      const store = await this.storeModel
        .findById(storeId)
        .select('_id')
        .lean()
        .exec();
      if (!store) throw new NotFoundException('Store not found');
    }
    if (orderId) {
      const order = await this.orderModel
        .findById(orderId)
        .select('_id')
        .lean()
        .exec();
      if (!order) throw new NotFoundException('Order not found');
    }

    // Determine reviewer name
    let displayName = reviewerName || 'Anonymous';
    if (reviewerId) {
      const user = (await this.userModel
        .findById(reviewerId)
        .select('firstName lastName')
        .lean()
        .exec()) as any;
      if (user) {
        displayName = `${user.firstName} ${user.lastName}`;
      }
    }

    // Create the review
    const review = new this.reviewModel({
      reviewerId: reviewerId ? new Types.ObjectId(reviewerId) : null,
      reviewerName: displayName,
      creatorId: creatorId ? new Types.ObjectId(creatorId) : null,
      storeId: storeId ? new Types.ObjectId(storeId) : null,
      listingId: listingId ? new Types.ObjectId(listingId) : null,
      orderId: orderId ? new Types.ObjectId(orderId) : null,
      rating,
      comment,
    });

    const savedReview = await review.save();

    // Update average ratings for affected targets
    if (storeId) {
      await this.updateStoreRating(storeId);
    }
    if (creatorId) {
      await this.updateCreatorRating(creatorId);
    }

    return savedReview;
  }

  // ─── Seller Reply ────────────────────────────────────────

  /**
   * Seller/creator can reply to a review on their store or creator profile.
   */
  async sellerReply(
    reviewId: string,
    sellerId: string,
    replyDto: SellerReplyDto,
  ): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify ownership: seller must own the store or be the creator
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
      throw new BadRequestException(
        'You can only reply to reviews on your own store or profile',
      );
    }

    review.sellerReply = replyDto.reply;
    review.sellerReplyAt = new Date();

    return review.save();
  }

  // ─── Get Reviews ─────────────────────────────────────────

  async findAll(
    queryDto: QueryReviewsDto,
  ): Promise<PaginatedResponse<ReviewDocument>> {
    const { page, perPage, listingId, storeId, creatorId, orderId } = queryDto;

    const filter: Record<string, any> = { isVisible: true };

    if (listingId) filter.listingId = new Types.ObjectId(listingId);
    if (storeId) filter.storeId = new Types.ObjectId(storeId);
    if (creatorId) filter.creatorId = new Types.ObjectId(creatorId);
    if (orderId) filter.orderId = new Types.ObjectId(orderId);

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

  // ─── Rating Aggregation ──────────────────────────────────

  private async updateStoreRating(storeId: string): Promise<void> {
    const result = await this.reviewModel.aggregate([
      { $match: { storeId: new Types.ObjectId(storeId), isVisible: true } },
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

  private async updateCreatorRating(creatorId: string): Promise<void> {
    const result = await this.reviewModel.aggregate([
      { $match: { creatorId: new Types.ObjectId(creatorId), isVisible: true } },
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
}