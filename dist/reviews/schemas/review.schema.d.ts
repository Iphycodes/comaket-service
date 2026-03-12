import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export type ReviewDocument = Review & Document;
export declare class Review extends BaseSchema {
    reviewerId: Types.ObjectId | null;
    reviewerName: string;
    creatorId: Types.ObjectId | null;
    storeId: Types.ObjectId | null;
    listingId: Types.ObjectId | null;
    orderId: Types.ObjectId | null;
    rating: number;
    comment?: string;
    isVisible: boolean;
    sellerReply?: string;
    sellerReplyAt?: Date;
}
export declare const ReviewSchema: import("mongoose").Schema<Review, import("mongoose").Model<Review, any, any, any, Document<unknown, any, Review> & Review & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Review, Document<unknown, {}, import("mongoose").FlatRecord<Review>> & import("mongoose").FlatRecord<Review> & {
    _id: Types.ObjectId;
}>;
