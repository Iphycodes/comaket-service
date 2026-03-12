import { PaginationDto } from '@common/dto/pagination.dto';
import { StoreStatus } from '@config/contants';
declare class StoreLocationDto {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}
declare class OperatingHoursDto {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}
declare class StoreBankDetailsDto {
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
}
declare class SocialLinksDto {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
}
declare class NotificationsDto {
    newOrder?: boolean;
    newReview?: boolean;
    lowStock?: boolean;
    promotions?: boolean;
}
export declare class CreateStoreDto {
    name: string;
    description?: string;
    tagline?: string;
    website?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    email?: string;
    categories?: string[];
    tags?: string[];
    location?: StoreLocationDto;
    socialLinks?: SocialLinksDto;
    operatingHours?: OperatingHoursDto;
    bankDetails?: StoreBankDetailsDto;
    returnPolicy?: string;
    notifications?: NotificationsDto;
}
declare const UpdateStoreDto_base: import("@nestjs/common").Type<Partial<CreateStoreDto>>;
export declare class UpdateStoreDto extends UpdateStoreDto_base {
    logo?: string;
    coverImage?: string;
    bio?: string;
}
export declare class QueryStoresDto extends PaginationDto {
    status?: StoreStatus;
    category?: string;
    state?: string;
    city?: string;
    creatorId?: string;
}
export {};
