import { Model } from 'mongoose';
import { ReviewDocument } from './schemas/review.schema';
import { StoreDocument } from '../stores/schemas/store.schema';
import { CreatorDocument } from '../creators/schemas/creator.schema';
import { StoresService } from '../stores/stores.service';
import { CreatorsService } from '../creators/creators.service';
import { CreateReviewDto, SellerReplyDto, QueryReviewsDto } from './dto/review.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
export declare class ReviewsService {
    private reviewModel;
    private orderModel;
    private userModel;
    private storeModel;
    private creatorModel;
    private storesService;
    private creatorsService;
    private readonly logger;
    constructor(reviewModel: Model<ReviewDocument>, orderModel: Model<any>, userModel: Model<any>, storeModel: Model<StoreDocument>, creatorModel: Model<CreatorDocument>, storesService: StoresService, creatorsService: CreatorsService);
    create(reviewerId: string | null, createDto: CreateReviewDto): Promise<ReviewDocument>;
    sellerReply(reviewId: string, sellerId: string, replyDto: SellerReplyDto): Promise<ReviewDocument>;
    findAll(queryDto: QueryReviewsDto): Promise<PaginatedResponse<ReviewDocument>>;
    private updateStoreRating;
    private updateCreatorRating;
}
