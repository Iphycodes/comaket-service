import { PaginationDto } from '@common/dto/pagination.dto';
import { CreatorPlan, CreatorStatus } from '@config/contants';
declare class SocialLinksDto {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
}
export declare class BankDetailsDto {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
}
declare class CreatorLocationDto {
    country?: string;
    state?: string;
    city?: string;
}
export declare class BecomeCreatorDto {
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    contactEmail?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    website?: string;
    socialLinks?: SocialLinksDto;
    profileImageUrl?: string;
    industries?: string[];
    location?: CreatorLocationDto;
    tags?: string[];
    planId?: string;
}
declare const UpdateCreatorDto_base: import("@nestjs/common").Type<Partial<BecomeCreatorDto>>;
export declare class UpdateCreatorDto extends UpdateCreatorDto_base {
    coverImage?: string;
    featuredWorks?: string[];
}
export declare class QueryCreatorsDto extends PaginationDto {
    status?: CreatorStatus;
    plan?: CreatorPlan;
    industry?: string;
    state?: string;
    city?: string;
    isVerified?: boolean;
}
export {};
