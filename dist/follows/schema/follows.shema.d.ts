import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export type FollowDocument = Follow & Document;
export declare enum FollowTargetType {
    Creator = "creator",
    Store = "store"
}
export declare class Follow extends BaseSchema {
    userId: Types.ObjectId;
    targetType: FollowTargetType;
    targetId: Types.ObjectId;
}
export declare const FollowSchema: import("mongoose").Schema<Follow, import("mongoose").Model<Follow, any, any, any, Document<unknown, any, Follow> & Follow & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Follow, Document<unknown, {}, import("mongoose").FlatRecord<Follow>> & import("mongoose").FlatRecord<Follow> & {
    _id: Types.ObjectId;
}>;
