import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreatorsService } from '../creators/creators.service';
import { StoresService } from '../stores/stores.service';
import { ListingsService } from '../listings/listings.service';
import { OrdersService } from '../orders/orders.service';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import { ReviewDocument } from '../reviews/schemas/review.schema';
import { ListingDocument } from '../listings/schemas/listing.schema';
import { AdminCreateListingDto } from './dto/admin.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CreatorStatus, StoreStatus, UserRole } from '@config/contants';
export declare class AdminService {
    private userModel;
    private creatorModel;
    private storeModel;
    private reviewModel;
    private listingModel;
    private usersService;
    private creatorsService;
    private storesService;
    private listingsService;
    private ordersService;
    private notificationsService;
    constructor(userModel: Model<UserDocument>, creatorModel: Model<CreatorDocument>, storeModel: Model<StoreDocument>, reviewModel: Model<ReviewDocument>, listingModel: Model<ListingDocument>, usersService: UsersService, creatorsService: CreatorsService, storesService: StoresService, listingsService: ListingsService, ordersService: OrdersService, notificationsService: NotificationsService);
    getDashboardStats(): Promise<{
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
    listUsers(page?: number, perPage?: number, role?: string, search?: string, status?: string): Promise<PaginatedResponse<UserDocument>>;
    updateUserRole(userId: string, role: UserRole): Promise<UserDocument>;
    updateUserStatus(userId: string, status: string): Promise<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    listCreators(page?: number, perPage?: number, status?: string, search?: string, plan?: string): Promise<PaginatedResponse<CreatorDocument>>;
    verifyCreator(creatorId: string): Promise<import("mongoose").Document<unknown, {}, CreatorDocument> & Creator & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    updateCreatorStatus(creatorId: string, status: CreatorStatus): Promise<import("mongoose").Document<unknown, {}, CreatorDocument> & Creator & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
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
    listStores(page?: number, perPage?: number, status?: string, search?: string): Promise<PaginatedResponse<StoreDocument>>;
    updateStoreStatus(storeId: string, status: StoreStatus): Promise<import("mongoose").Document<unknown, {}, StoreDocument> & Store & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    listReviews(page?: number, perPage?: number, search?: string, anonymous?: string, creatorId?: string, storeId?: string): Promise<PaginatedResponse<ReviewDocument>>;
    deleteReview(reviewId: string): Promise<{
        deleted: boolean;
    }>;
    bulkDeleteReviews(reviewIds: string[]): Promise<{
        deleted: number;
    }>;
    inviteAdmin(email: string, role: UserRole, invitedBy: string): Promise<{
        message: string;
        userId: any;
    }>;
    resendAdminInvite(adminId: string): Promise<{
        message: string;
    }>;
    removeAdmin(adminId: string, requesterId: string): Promise<{
        message: string;
    }>;
    listAdmins(): Promise<(import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    adminCreateListing(dto: AdminCreateListingDto, adminUserId: string): Promise<ListingDocument>;
    private generateTempPassword;
}
