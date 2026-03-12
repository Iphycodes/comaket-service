import { Model, Types } from 'mongoose';
import { ListingDocument } from '../listings/schemas/listing.schema';
import { SavedProductDocument } from './schema/saved-product.schema';
export declare class SavedProductsService {
    private savedProductModel;
    private listingModel;
    private readonly logger;
    constructor(savedProductModel: Model<SavedProductDocument>, listingModel: Model<ListingDocument>);
    toggle(userId: string, listingId: string): Promise<{
        saved: boolean;
        message: string;
    }>;
    getSavedProducts(userId: string, page?: number, perPage?: number): Promise<{
        items: {
            _id: any;
            savedAt: Date;
            listing: Types.ObjectId;
        }[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    checkSavedStatus(userId: string, listingIds: string[]): Promise<Record<string, boolean>>;
    getSavedCount(userId: string): Promise<{
        count: number;
    }>;
    remove(userId: string, listingId: string): Promise<{
        message: string;
    }>;
}
