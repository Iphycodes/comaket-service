import { PaginationDto } from '@common/dto/pagination.dto';
export declare class CreateReviewDto {
    creatorId?: string;
    storeId?: string;
    listingId?: string;
    orderId?: string;
    rating: number;
    comment?: string;
    reviewerName?: string;
}
export declare class SellerReplyDto {
    reply: string;
}
export declare class QueryReviewsDto extends PaginationDto {
    listingId?: string;
    storeId?: string;
    creatorId?: string;
    orderId?: string;
}
