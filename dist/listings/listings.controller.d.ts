import { ListingsService } from './listings.service';
import { CreateListingDto, UpdateListingDto, AdminReviewListingDto, QueryListingsDto } from './dto/listing.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    create(user: JwtPayload, createListingDto: CreateListingDto): Promise<import("./schemas/listing.schema").ListingDocument>;
    findMyListings(user: JwtPayload, queryDto: QueryListingsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/listing.schema").ListingDocument>>;
    update(listingId: string, user: JwtPayload, updateListingDto: UpdateListingDto): Promise<import("./schemas/listing.schema").ListingDocument>;
    remove(listingId: string, user: JwtPayload): Promise<{
        message: string;
    }>;
    counterOffer(listingId: string, user: JwtPayload, counterOffer: number): Promise<import("./schemas/listing.schema").ListingDocument>;
    acceptOffer(listingId: string, user: JwtPayload): Promise<import("./schemas/listing.schema").ListingDocument>;
    rejectOffer(listingId: string, user: JwtPayload): Promise<import("./schemas/listing.schema").ListingDocument>;
    sellerDelist(listingId: string, user: JwtPayload): Promise<import("./schemas/listing.schema").ListingDocument>;
    findAllAdmin(queryDto: QueryListingsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/listing.schema").ListingDocument>>;
    findPending(queryDto: QueryListingsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/listing.schema").ListingDocument>>;
    adminReview(listingId: string, user: JwtPayload, reviewDto: AdminReviewListingDto): Promise<import("./schemas/listing.schema").ListingDocument>;
    confirmFee(listingId: string, user: JwtPayload): Promise<import("./schemas/listing.schema").ListingDocument>;
    findAll(queryDto: QueryListingsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/listing.schema").ListingDocument>>;
    findByStore(storeId: string, queryDto: QueryListingsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/listing.schema").ListingDocument>>;
    findByCreator(creatorId: string, queryDto: QueryListingsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/listing.schema").ListingDocument>>;
    findOne(listingId: string): Promise<import("./schemas/listing.schema").ListingDocument>;
}
