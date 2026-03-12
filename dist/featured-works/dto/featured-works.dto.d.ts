import { PaginationDto } from '@common/dto/pagination.dto';
import { FeaturedWorkOwnerType } from '../schema/featured-works.schema';
export declare class CreateFeaturedWorkDto {
    ownerType: FeaturedWorkOwnerType;
    ownerId: string;
    images: string[];
    title?: string;
    description?: string;
}
export declare class UpdateFeaturedWorkDto {
    images?: string[];
    addImages?: string[];
    removeImages?: string[];
    title?: string;
    description?: string;
}
export declare class ReorderFeaturedWorksDto {
    ownerType: FeaturedWorkOwnerType;
    ownerId: string;
    orderedIds: string[];
}
export declare class QueryFeaturedWorksDto extends PaginationDto {
    ownerType: FeaturedWorkOwnerType;
    ownerId: string;
}
