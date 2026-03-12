import { CreatorStatus, Currency, ItemCondition, ListingType, StoreStatus, UserRole } from '@config/contants';
export declare class UpdateUserRoleDto {
    role: UserRole;
}
export declare class UpdateCreatorStatusDto {
    status: CreatorStatus;
}
export declare class UpdateStoreStatusDto {
    status: StoreStatus;
}
export declare class UpdateUserStatusDto {
    status: string;
}
export declare class AdminQueryDto {
    page?: number;
    perPage?: number;
    search?: string;
    role?: string;
    status?: string;
    plan?: string;
}
declare class AdminListingPriceDto {
    amount: number;
    currency?: Currency;
    negotiable?: boolean;
}
declare class AdminListingMediaDto {
    url: string;
    type?: string;
    thumbnail?: string;
}
declare class AdminListingLocationDto {
    country?: string;
    state?: string;
    city?: string;
}
export declare class AdminCreateListingDto {
    itemName: string;
    description: string;
    condition: ItemCondition;
    type: ListingType;
    askingPrice: AdminListingPriceDto;
    media: AdminListingMediaDto[];
    category?: string;
    tags?: string[];
    quantity?: number;
    location?: AdminListingLocationDto;
    sellingPrice?: number;
    commissionRate?: number;
}
export {};
