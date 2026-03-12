import { AdminService } from './admin.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { UpdatePlatformSettingsDto } from '../platform-settings/dto/update-settings.dto';
import { AdminCreateListingDto, AdminQueryDto, UpdateCreatorStatusDto, UpdateStoreStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    private readonly platformSettingsService;
    constructor(adminService: AdminService, platformSettingsService: PlatformSettingsService);
    getDashboard(): Promise<{
        users: {
            total: number;
        };
        creators: {
            total: number;
        };
        stores: {
            total: number;
        };
        listings: {
            total: number;
            pending: number;
            live: number;
        };
        orders: {
            total: number;
            pending: number;
        };
        revenue: {
            totalRevenue: number;
            platformRevenue: number;
            sellerPayouts: number;
        };
    }>;
    getStats(): Promise<{
        users: {
            total: number;
            active: number;
            suspended: number;
            byRole: {
                user: number;
                creator: number;
                admin: number;
                super_admin: number;
            };
        };
        creators: {
            total: number;
            active: number;
            suspended: number;
            verified: number;
            byPlan: {
                starter: number;
                pro: number;
                business: number;
            };
        };
        stores: {
            total: number;
            active: number;
            suspended: number;
            pending_approval: number;
            closed: number;
        };
        listings: {
            total: number;
            in_review: number;
            live: number;
            approved: number;
            rejected: number;
            suspended: number;
            sold: number;
            expired: number;
        };
        orders: {
            total: number;
            pending: number;
            confirmed: number;
            processing: number;
            shipped: number;
            delivered: number;
            completed: number;
            cancelled: number;
            refunded: number;
        };
        revenue: {
            totalRevenue: number;
            platformRevenue: number;
            sellerPayouts: number;
        };
        reviews: {
            total: number;
        };
    }>;
    listUsers(query: AdminQueryDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("../users/schemas/user.schema").UserDocument>>;
    updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<import("../users/schemas/user.schema").UserDocument>;
    updateUserStatus(userId: string, dto: UpdateUserStatusDto): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").UserDocument> & import("../users/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    listCreators(query: AdminQueryDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("../creators/schemas/creator.schema").CreatorDocument>>;
    verifyCreator(creatorId: string): Promise<import("mongoose").Document<unknown, {}, import("../creators/schemas/creator.schema").CreatorDocument> & import("../creators/schemas/creator.schema").Creator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateCreatorStatus(creatorId: string, dto: UpdateCreatorStatusDto): Promise<import("mongoose").Document<unknown, {}, import("../creators/schemas/creator.schema").CreatorDocument> & import("../creators/schemas/creator.schema").Creator & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    listStores(query: AdminQueryDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("../stores/schemas/store.schema").StoreDocument>>;
    updateStoreStatus(storeId: string, dto: UpdateStoreStatusDto): Promise<import("mongoose").Document<unknown, {}, import("../stores/schemas/store.schema").StoreDocument> & import("../stores/schemas/store.schema").Store & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    adminCreateListing(dto: AdminCreateListingDto, req: any): Promise<import("../listings/schemas/listing.schema").ListingDocument>;
    listReviews(query: any): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("../reviews/schemas/review.schema").ReviewDocument>>;
    deleteReview(reviewId: string): Promise<{
        deleted: boolean;
    }>;
    bulkDeleteReviews(body: {
        reviewIds: string[];
    }): Promise<{
        deleted: number;
    }>;
    listAdmins(): Promise<(import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").UserDocument> & import("../users/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    inviteAdmin(body: {
        email: string;
        role?: string;
    }, req: any): Promise<{
        message: string;
        userId: any;
    }>;
    resendAdminInvite(adminId: string): Promise<{
        message: string;
    }>;
    removeAdmin(adminId: string, req: any): Promise<{
        message: string;
    }>;
    getSettings(): Promise<import("mongoose").Document<unknown, {}, import("../platform-settings/schemas/platform-settings.schema").PlatformSettings> & import("../platform-settings/schemas/platform-settings.schema").PlatformSettings & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateSettings(dto: UpdatePlatformSettingsDto): Promise<import("mongoose").Document<unknown, {}, import("../platform-settings/schemas/platform-settings.schema").PlatformSettings> & import("../platform-settings/schemas/platform-settings.schema").PlatformSettings & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
