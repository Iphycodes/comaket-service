import { ReviewsService } from './reviews.service';
import { CreateReviewDto, SellerReplyDto, QueryReviewsDto } from './dto/review.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: any, createDto: CreateReviewDto): Promise<import("./schemas/review.schema").ReviewDocument>;
    sellerReply(reviewId: string, user: JwtPayload, replyDto: SellerReplyDto): Promise<import("./schemas/review.schema").ReviewDocument>;
    findAll(queryDto: QueryReviewsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/review.schema").ReviewDocument>>;
}
