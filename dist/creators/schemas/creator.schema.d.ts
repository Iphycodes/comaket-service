import { Document, Types } from 'mongoose';
import { BaseSchema } from '@common/schemas/base-schema';
import { CreatorPlan, CreatorStatus } from '@config/contants';
export type CreatorDocument = Creator & Document;
declare class SocialLinks {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
}
declare class BankDetails {
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
}
export declare class Creator extends BaseSchema {
    userId: Types.ObjectId;
    username: string;
    slug: string;
    bio?: string;
    profileImageUrl?: string;
    coverImage?: string;
    contactEmail?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    website?: string;
    socialLinks: SocialLinks;
    industries: string[];
    tags: string[];
    location?: {
        country?: string;
        state?: string;
        city?: string;
    };
    featuredWorks: string[];
    plan: CreatorPlan;
    paystackSubscriptionCode?: string;
    paystackCustomerCode?: string;
    paystackEmailToken?: string;
    subscriptionStatus: string;
    planStartedAt?: Date;
    planExpiresAt?: Date;
    planAmountPaid: number;
    planPaymentReference?: string;
    planPaymentChannel?: string;
    status: CreatorStatus;
    isVerified: boolean;
    bankDetails?: BankDetails;
    totalStores: number;
    totalListings: number;
    totalSales: number;
    rating: number;
    totalReviews: number;
    totalFollowers: number;
}
export declare const CreatorSchema: import("mongoose").Schema<Creator, import("mongoose").Model<Creator, any, any, any, Document<unknown, any, Creator> & Creator & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Creator, Document<unknown, {}, import("mongoose").FlatRecord<Creator>> & import("mongoose").FlatRecord<Creator> & {
    _id: Types.ObjectId;
}>;
export {};
