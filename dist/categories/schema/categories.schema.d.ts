import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export type CategoryDocument = Category & Document;
export declare class Category extends BaseSchema {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    parentId?: Types.ObjectId;
    sortOrder: number;
    isActive: boolean;
    listingCount: number;
}
export declare const CategorySchema: import("mongoose").Schema<Category, import("mongoose").Model<Category, any, any, any, Document<unknown, any, Category> & Category & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Category, Document<unknown, {}, import("mongoose").FlatRecord<Category>> & import("mongoose").FlatRecord<Category> & {
    _id: Types.ObjectId;
}>;
