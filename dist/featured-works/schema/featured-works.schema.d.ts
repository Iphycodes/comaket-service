import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export type FeaturedWorkDocument = FeaturedWork & Document;
export declare enum FeaturedWorkOwnerType {
    Creator = "creator",
    Store = "store"
}
export declare class FeaturedWork extends BaseSchema {
    userId: Types.ObjectId;
    ownerType: FeaturedWorkOwnerType;
    ownerId: Types.ObjectId;
    images: string[];
    title?: string;
    description?: string;
    position: number;
}
export declare const FeaturedWorkSchema: import("mongoose").Schema<FeaturedWork, import("mongoose").Model<FeaturedWork, any, any, any, Document<unknown, any, FeaturedWork> & FeaturedWork & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FeaturedWork, Document<unknown, {}, import("mongoose").FlatRecord<FeaturedWork>> & import("mongoose").FlatRecord<FeaturedWork> & {
    _id: Types.ObjectId;
}>;
