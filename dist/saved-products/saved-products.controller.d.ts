import { SavedProductsService } from './saved-products.service';
import { SaveProductDto, QuerySavedProductsDto } from './dto/saved-product.dto';
export declare class SavedProductsController {
    private readonly savedProductsService;
    constructor(savedProductsService: SavedProductsService);
    toggle(req: any, dto: SaveProductDto): Promise<{
        saved: boolean;
        message: string;
    }>;
    checkSavedStatus(req: any, listingIds: string[]): Promise<Record<string, boolean>>;
    getSavedProducts(req: any, query: QuerySavedProductsDto): Promise<{
        items: {
            _id: any;
            savedAt: Date;
            listing: import("mongoose").Types.ObjectId;
        }[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    getSavedCount(req: any): Promise<{
        count: number;
    }>;
    remove(req: any, listingId: string): Promise<{
        message: string;
    }>;
}
