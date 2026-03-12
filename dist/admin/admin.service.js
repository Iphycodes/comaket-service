"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
const creators_service_1 = require("../creators/creators.service");
const stores_service_1 = require("../stores/stores.service");
const listings_service_1 = require("../listings/listings.service");
const orders_service_1 = require("../orders/orders.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
const review_schema_1 = require("../reviews/schemas/review.schema");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const contants_1 = require("../config/contants");
let AdminService = class AdminService {
    constructor(userModel, creatorModel, storeModel, reviewModel, listingModel, usersService, creatorsService, storesService, listingsService, ordersService, notificationsService) {
        this.userModel = userModel;
        this.creatorModel = creatorModel;
        this.storeModel = storeModel;
        this.reviewModel = reviewModel;
        this.listingModel = listingModel;
        this.usersService = usersService;
        this.creatorsService = creatorsService;
        this.storesService = storesService;
        this.listingsService = listingsService;
        this.ordersService = ordersService;
        this.notificationsService = notificationsService;
    }
    async getDashboardStats() {
        const [totalUsers, totalCreators, totalStores, totalListings, pendingListings, liveListings, totalOrders, pendingOrders, revenue,] = await Promise.all([
            this.usersService.countUsers(),
            this.creatorsService.countCreators(),
            this.storesService.countStores(),
            this.listingsService.countListings(),
            this.listingsService.countListings({
                status: contants_1.ListingStatus.InReview,
            }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Live }),
            this.ordersService.countOrders(),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Pending }),
            this.ordersService.calculateRevenue(),
        ]);
        return {
            users: { total: totalUsers },
            creators: { total: totalCreators },
            stores: { total: totalStores },
            listings: {
                total: totalListings,
                pending: pendingListings,
                live: liveListings,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
            },
            revenue: {
                totalRevenue: revenue.totalRevenue,
                platformRevenue: revenue.platformRevenue,
                sellerPayouts: revenue.sellerPayouts,
            },
        };
    }
    async listUsers(page = 1, perPage = 20, role, search, status) {
        const filter = {};
        if (role)
            filter.role = role;
        if (status === 'suspended')
            filter.isSuspended = true;
        else if (status === 'active')
            filter.isSuspended = { $ne: true };
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'mobile.phoneNumber': { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async updateUserRole(userId, role) {
        return this.usersService.updateInternal(userId, { role });
    }
    async updateUserStatus(userId, status) {
        const isSuspended = status === 'suspended';
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: { isSuspended } }, { new: true })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async listCreators(page = 1, perPage = 20, status, search, plan) {
        const filter = {};
        if (status)
            filter.status = status;
        if (plan)
            filter.plan = plan;
        if (search) {
            const matchingUsers = await this.userModel
                .find({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            })
                .select('_id')
                .exec();
            const userIds = matchingUsers.map((u) => u._id);
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
            ];
        }
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.creatorModel
                .find(filter)
                .populate('userId', 'firstName lastName email avatar mobile')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .exec(),
            this.creatorModel.countDocuments(filter).exec(),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async verifyCreator(creatorId) {
        const creator = await this.creatorModel
            .findByIdAndUpdate(creatorId, { $set: { isVerified: true } }, { new: true })
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        return creator;
    }
    async updateCreatorStatus(creatorId, status) {
        const creator = await this.creatorModel
            .findByIdAndUpdate(creatorId, { $set: { status } }, { new: true })
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        return creator;
    }
    async getStats() {
        const [totalUsers, activeUsers, suspendedUsers, usersByRole, totalCreators, activeCreators, suspendedCreators, creatorsByPlan, verifiedCreators, totalStores, activeStores, suspendedStores, pendingApprovalStores, closedStores, totalListings, inReviewListings, liveListings, approvedListings, rejectedListings, suspendedListings, soldListings, expiredListings, totalOrders, pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, completedOrders, cancelledOrders, refundedOrders, revenue, totalReviews,] = await Promise.all([
            this.userModel.countDocuments({}).exec(),
            this.userModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
            this.userModel.countDocuments({ isSuspended: true }).exec(),
            this.userModel.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } },
            ]),
            this.creatorModel.countDocuments({}).exec(),
            this.creatorModel.countDocuments({ status: contants_1.CreatorStatus.Active }).exec(),
            this.creatorModel.countDocuments({ status: contants_1.CreatorStatus.Suspended }).exec(),
            this.creatorModel.aggregate([
                { $group: { _id: '$plan', count: { $sum: 1 } } },
            ]),
            this.creatorModel.countDocuments({ isVerified: true }).exec(),
            this.storeModel.countDocuments({}).exec(),
            this.storeModel.countDocuments({ status: contants_1.StoreStatus.Active }).exec(),
            this.storeModel.countDocuments({ status: contants_1.StoreStatus.Suspended }).exec(),
            this.storeModel.countDocuments({ status: contants_1.StoreStatus.PendingApproval }).exec(),
            this.storeModel.countDocuments({ status: contants_1.StoreStatus.Closed }).exec(),
            this.listingsService.countListings(),
            this.listingsService.countListings({ status: contants_1.ListingStatus.InReview }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Live }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Approved }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Rejected }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Suspended }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Sold }),
            this.listingsService.countListings({ status: contants_1.ListingStatus.Expired }),
            this.ordersService.countOrders(),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Pending }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Confirmed }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Processing }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Shipped }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Delivered }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Completed }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Cancelled }),
            this.ordersService.countOrders({ status: contants_1.OrderStatus.Refunded }),
            this.ordersService.calculateRevenue(),
            this.reviewModel.countDocuments({}).exec(),
        ]);
        const roleMap = {};
        for (const r of usersByRole) {
            roleMap[r._id] = r.count;
        }
        const planMap = {};
        for (const p of creatorsByPlan) {
            planMap[p._id] = p.count;
        }
        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers,
                byRole: {
                    user: roleMap[contants_1.UserRole.User] || 0,
                    creator: roleMap[contants_1.UserRole.Creator] || 0,
                    admin: roleMap[contants_1.UserRole.Admin] || 0,
                    super_admin: roleMap[contants_1.UserRole.SuperAdmin] || 0,
                },
            },
            creators: {
                total: totalCreators,
                active: activeCreators,
                suspended: suspendedCreators,
                verified: verifiedCreators,
                byPlan: {
                    starter: planMap[contants_1.CreatorPlan.Starter] || 0,
                    pro: planMap[contants_1.CreatorPlan.Pro] || 0,
                    business: planMap[contants_1.CreatorPlan.Business] || 0,
                },
            },
            stores: {
                total: totalStores,
                active: activeStores,
                suspended: suspendedStores,
                pending_approval: pendingApprovalStores,
                closed: closedStores,
            },
            listings: {
                total: totalListings,
                in_review: inReviewListings,
                live: liveListings,
                approved: approvedListings,
                rejected: rejectedListings,
                suspended: suspendedListings,
                sold: soldListings,
                expired: expiredListings,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                confirmed: confirmedOrders,
                processing: processingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                refunded: refundedOrders,
            },
            revenue: {
                totalRevenue: revenue.totalRevenue,
                platformRevenue: revenue.platformRevenue,
                sellerPayouts: revenue.sellerPayouts,
            },
            reviews: {
                total: totalReviews,
            },
        };
    }
    async listStores(page = 1, perPage = 20, status, search) {
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.storeModel
                .find(filter)
                .populate({
                path: 'creatorId',
                select: 'username businessName slug logo isVerified',
            })
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .exec(),
            this.storeModel.countDocuments(filter).exec(),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async updateStoreStatus(storeId, status) {
        const store = await this.storeModel
            .findByIdAndUpdate(storeId, { $set: { status } }, { new: true })
            .exec();
        if (!store) {
            throw new common_1.NotFoundException('Store not found');
        }
        return store;
    }
    async listReviews(page = 1, perPage = 20, search, anonymous, creatorId, storeId) {
        const filter = {};
        if (search) {
            filter.$or = [
                { comment: { $regex: search, $options: 'i' } },
                { reviewerName: { $regex: search, $options: 'i' } },
            ];
        }
        if (anonymous === 'true')
            filter.reviewerId = null;
        else if (anonymous === 'false')
            filter.reviewerId = { $ne: null };
        if (creatorId)
            filter.creatorId = new mongoose_2.Types.ObjectId(creatorId);
        if (storeId)
            filter.storeId = new mongoose_2.Types.ObjectId(storeId);
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.reviewModel
                .find(filter)
                .populate('reviewerId', 'firstName lastName email avatar')
                .populate('storeId', 'name slug')
                .populate('creatorId', 'username businessName slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .exec(),
            this.reviewModel.countDocuments(filter).exec(),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async deleteReview(reviewId) {
        const review = await this.reviewModel.findByIdAndDelete(reviewId).exec();
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return { deleted: true };
    }
    async bulkDeleteReviews(reviewIds) {
        const result = await this.reviewModel
            .deleteMany({ _id: { $in: reviewIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .exec();
        return { deleted: result.deletedCount };
    }
    async inviteAdmin(email, role, invitedBy) {
        const existing = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (existing) {
            if (existing.role !== contants_1.UserRole.Admin && existing.role !== contants_1.UserRole.SuperAdmin) {
                existing.role = role;
                await existing.save();
                return { message: 'Existing user promoted to admin', userId: existing._id };
            }
            throw new common_1.BadRequestException('This email is already an admin');
        }
        const tempPassword = this.generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const user = await this.userModel.create({
            firstName: 'Admin',
            lastName: 'User',
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            isEmailVerified: true,
            authProvider: 'local',
        });
        try {
            await this.notificationsService.sendRawEmail(email, 'You have been invited as an Admin on Comaket', `<h2>Welcome to Comaket Admin</h2>
         <p>You have been invited as a <strong>${role === contants_1.UserRole.SuperAdmin ? 'Super Admin' : 'Admin'}</strong>.</p>
         <p>Here are your login credentials:</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Temporary Password:</strong> ${tempPassword}</p>
         <p>Please login and change your password immediately.</p>`);
        }
        catch (err) {
        }
        return { message: 'Admin invited successfully', userId: user._id };
    }
    async resendAdminInvite(adminId) {
        const admin = await this.userModel.findById(adminId).exec();
        if (!admin)
            throw new common_1.NotFoundException('Admin not found');
        if (admin.role !== contants_1.UserRole.Admin && admin.role !== contants_1.UserRole.SuperAdmin) {
            throw new common_1.BadRequestException('User is not an admin');
        }
        const tempPassword = this.generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        admin.password = hashedPassword;
        await admin.save();
        try {
            await this.notificationsService.sendRawEmail(admin.email, 'Comaket Admin - New Login Credentials', `<h2>New Login Credentials</h2>
         <p>Your admin credentials have been reset:</p>
         <p><strong>Email:</strong> ${admin.email}</p>
         <p><strong>New Temporary Password:</strong> ${tempPassword}</p>
         <p>Please login and change your password.</p>`);
        }
        catch (err) {
        }
        return { message: 'Invite resent' };
    }
    async removeAdmin(adminId, requesterId) {
        const admin = await this.userModel.findById(adminId).exec();
        if (!admin)
            throw new common_1.NotFoundException('Admin not found');
        if (admin.role === contants_1.UserRole.SuperAdmin) {
            throw new common_1.BadRequestException('Cannot remove a super admin');
        }
        if (admin._id.toString() === requesterId) {
            throw new common_1.BadRequestException('Cannot remove yourself');
        }
        admin.role = contants_1.UserRole.User;
        await admin.save();
        return { message: 'Admin removed' };
    }
    async listAdmins() {
        return this.userModel
            .find({ role: { $in: [contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin] } })
            .select('firstName lastName email role avatar createdAt')
            .sort({ createdAt: -1 })
            .exec();
    }
    async adminCreateListing(dto, adminUserId) {
        const store = await this.storeModel
            .findOne({ slug: 'kraft-official' })
            .exec();
        if (!store) {
            throw new common_1.NotFoundException('Kraft_official store not found. Please run the seed script first.');
        }
        const adminPricing = {};
        if (dto.sellingPrice != null)
            adminPricing.sellingPrice = dto.sellingPrice;
        if (dto.commissionRate != null)
            adminPricing.commissionRate = dto.commissionRate;
        const listing = new this.listingModel({
            itemName: dto.itemName,
            description: dto.description,
            condition: dto.condition,
            type: dto.type,
            askingPrice: dto.askingPrice,
            media: dto.media,
            category: dto.category || null,
            tags: dto.tags || [],
            quantity: dto.quantity || 1,
            location: dto.location || null,
            storeId: store._id,
            creatorId: store.creatorId,
            userId: store.userId,
            status: contants_1.ListingStatus.Live,
            reviewInfo: {
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                adminNotes: 'Admin-created listing — bypassed review.',
            },
            ...(Object.keys(adminPricing).length > 0 ? { adminPricing } : {}),
        });
        const saved = await listing.save();
        await this.storeModel
            .findByIdAndUpdate(store._id, { $inc: { totalListings: 1 } })
            .exec();
        return saved;
    }
    generateTempPassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __param(2, (0, mongoose_1.InjectModel)(store_schema_1.Store.name)),
    __param(3, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(4, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService,
        creators_service_1.CreatorsService,
        stores_service_1.StoresService,
        listings_service_1.ListingsService,
        orders_service_1.OrdersService,
        notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map