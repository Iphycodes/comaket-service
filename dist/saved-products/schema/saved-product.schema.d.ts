import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export type SavedProductDocument = SavedProduct & Document;
export declare class SavedProduct extends BaseSchema {
    userId: Types.ObjectId;
    listingId: Types.ObjectId;
}
export declare const SavedProductSchema: import("mongoose").Schema<SavedProduct, import("mongoose").Model<SavedProduct, any, any, any, Document<unknown, any, SavedProduct> & SavedProduct & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SavedProduct, Document<unknown, {}, import("mongoose").FlatRecord<SavedProduct>> & import("mongoose").FlatRecord<SavedProduct> & {
    _id: Types.ObjectId;
}>;
