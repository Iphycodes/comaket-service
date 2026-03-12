export declare enum EntityType {
    User = "user",
    Creator = "creator",
    Store = "store",
    Listing = "listing",
    Category = "category"
}
export declare const ENTITY_FIELD_MAP: Record<string, {
    single: string[];
    array: string[];
}>;
export declare class UploadMediaDto {
    entityType: EntityType;
    entityId: string;
    field: string;
    mediaType?: string;
}
export declare class DeleteMediaDto {
    entityType: EntityType;
    entityId: string;
    field: string;
    imageUrl?: string;
}
