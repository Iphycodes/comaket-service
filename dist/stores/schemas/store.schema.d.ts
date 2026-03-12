import { Document, Types } from 'mongoose';
import { StoreStatus } from '@config/contants';
import { BaseSchema } from '@common/schemas/base-schema';
export type StoreDocument = Store & Document;
declare class OperatingHours {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}
declare class StoreLocation {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}
export declare class Store extends BaseSchema {
    creatorId: Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    slug: string;
    logo?: string;
    coverImage?: string;
    description?: string;
    tagline?: string;
    website?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        tiktok?: string;
        youtube?: string;
    };
    phoneNumber?: string;
    whatsappNumber?: string;
    email?: string;
    location: StoreLocation;
    categories: string[];
    tags: string[];
    featuredWorks: string[];
    bankDetails?: {
        bankName?: string;
        bankCode?: string;
        accountNumber?: string;
        accountName?: string;
    };
    operatingHours: OperatingHours;
    returnPolicy?: string;
    notifications?: {
        newOrder?: boolean;
        newReview?: boolean;
        lowStock?: boolean;
        promotions?: boolean;
    };
    status: StoreStatus;
    isVisible: boolean;
    totalListings: number;
    totalSales: number;
    rating: number;
    totalReviews: number;
    followers: number;
}
export declare const StoreSchema: import("mongoose").Schema<Store, import("mongoose").Model<Store, any, any, any, Document<unknown, any, Store> & Store & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Store, Document<unknown, {}, import("mongoose").FlatRecord<Store>> & import("mongoose").FlatRecord<Store> & {
    _id: Types.ObjectId;
}>;
export {};
