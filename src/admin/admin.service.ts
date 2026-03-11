/**
 * admin/admin.service.ts - Admin Dashboard & Management
 * ========================================================
 * Provides admin-level operations:
 * - Dashboard stats (users, creators, stores, listings, orders, revenue)
 * - User management (list, update role, suspend)
 * - Creator management (verify, suspend)
 * - Listing management (handled via ListingsService admin endpoints)
 * - Order management (handled via OrdersService admin endpoints)
 *
 * This service aggregates data from ALL other services to give
 * admins a complete platform overview.
 */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreatorsService } from '../creators/creators.service';
import { StoresService } from '../stores/stores.service';
import { ListingsService } from '../listings/listings.service';
import { OrdersService } from '../orders/orders.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { Listing, ListingDocument } from '../listings/schemas/listing.schema';
import { AdminCreateListingDto } from './dto/admin.dto';

import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import {
  CreatorPlan,
  CreatorStatus,
  ListingStatus,
  OrderStatus,
  PaymentStatus,
  StoreStatus,
  UserRole,
} from '@config/contants';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    private usersService: UsersService,
    private creatorsService: CreatorsService,
    private storesService: StoresService,
    private listingsService: ListingsService,
    private ordersService: OrdersService,
    private notificationsService: NotificationsService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD STATS
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /admin/dashboard
   *
   * Returns a comprehensive overview of the platform:
   * - Total users, creators, stores, listings, orders
   * - Revenue breakdown (total, platform, seller payouts)
   * - Pending items (listings awaiting review, etc.)
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalCreators,
      totalStores,
      totalListings,
      pendingListings,
      liveListings,
      totalOrders,
      pendingOrders,
      revenue,
    ] = await Promise.all([
      this.usersService.countUsers(),
      this.creatorsService.countCreators(),
      this.storesService.countStores(),
      this.listingsService.countListings(),
      this.listingsService.countListings({
        status: ListingStatus.InReview,
      }),
      this.listingsService.countListings({ status: ListingStatus.Live }),
      this.ordersService.countOrders(),
      this.ordersService.countOrders({ status: OrderStatus.Pending }),
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

  // ═══════════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * List all users with pagination.
   */
  async listUsers(
    page: number = 1,
    perPage: number = 20,
    role?: string,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<UserDocument>> {
    const filter: Record<string, any> = {};

    if (role) filter.role = role;
    if (status === 'suspended') filter.isSuspended = true;
    else if (status === 'active') filter.isSuspended = { $ne: true };
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

  /**
   * Update a user's role (e.g., promote to admin).
   */
  async updateUserRole(userId: string, role: UserRole) {
    return this.usersService.updateInternal(userId, { role });
  }

  /**
   * Suspend or reactivate a user.
   */
  async updateUserStatus(userId: string, status: string) {
    const isSuspended = status === 'suspended';

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { isSuspended } },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ═══════════════════════════════════════════════════════════
  // CREATOR MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * List all creators with pagination.
   */
  async listCreators(
    page: number = 1,
    perPage: number = 20,
    status?: string,
    search?: string,
    plan?: string,
  ): Promise<PaginatedResponse<CreatorDocument>> {
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (search) {
      // First find matching user IDs by name/email
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

  /**
   * Verify a creator (add the verified badge).
   */
  async verifyCreator(creatorId: string) {
    const creator = await this.creatorModel
      .findByIdAndUpdate(
        creatorId,
        { $set: { isVerified: true } },
        { new: true },
      )
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  /**
   * Suspend or reactivate a creator.
   */
  async updateCreatorStatus(creatorId: string, status: CreatorStatus) {
    const creator = await this.creatorModel
      .findByIdAndUpdate(creatorId, { $set: { status } }, { new: true })
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  // ═══════════════════════════════════════════════════════════
  // COMPREHENSIVE STATS
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /admin/stats
   *
   * Returns detailed counts broken down by status for every entity.
   * Used by all admin pages to show metrics without frontend calculation.
   */
  async getStats() {
    const [
      // Users
      totalUsers,
      activeUsers,
      suspendedUsers,
      usersByRole,
      // Creators
      totalCreators,
      activeCreators,
      suspendedCreators,
      creatorsByPlan,
      verifiedCreators,
      // Stores
      totalStores,
      activeStores,
      suspendedStores,
      pendingApprovalStores,
      closedStores,
      // Listings
      totalListings,
      inReviewListings,
      liveListings,
      approvedListings,
      rejectedListings,
      suspendedListings,
      soldListings,
      expiredListings,
      // Orders
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      completedOrders,
      cancelledOrders,
      refundedOrders,
      // Revenue
      revenue,
      // Reviews
      totalReviews,
    ] = await Promise.all([
      // Users
      this.userModel.countDocuments({}).exec(),
      this.userModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
      this.userModel.countDocuments({ isSuspended: true }).exec(),
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      // Creators
      this.creatorModel.countDocuments({}).exec(),
      this.creatorModel.countDocuments({ status: CreatorStatus.Active }).exec(),
      this.creatorModel.countDocuments({ status: CreatorStatus.Suspended }).exec(),
      this.creatorModel.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      this.creatorModel.countDocuments({ isVerified: true }).exec(),
      // Stores
      this.storeModel.countDocuments({}).exec(),
      this.storeModel.countDocuments({ status: StoreStatus.Active }).exec(),
      this.storeModel.countDocuments({ status: StoreStatus.Suspended }).exec(),
      this.storeModel.countDocuments({ status: StoreStatus.PendingApproval }).exec(),
      this.storeModel.countDocuments({ status: StoreStatus.Closed }).exec(),
      // Listings
      this.listingsService.countListings(),
      this.listingsService.countListings({ status: ListingStatus.InReview }),
      this.listingsService.countListings({ status: ListingStatus.Live }),
      this.listingsService.countListings({ status: ListingStatus.Approved }),
      this.listingsService.countListings({ status: ListingStatus.Rejected }),
      this.listingsService.countListings({ status: ListingStatus.Suspended }),
      this.listingsService.countListings({ status: ListingStatus.Sold }),
      this.listingsService.countListings({ status: ListingStatus.Expired }),
      // Orders
      this.ordersService.countOrders(),
      this.ordersService.countOrders({ status: OrderStatus.Pending }),
      this.ordersService.countOrders({ status: OrderStatus.Confirmed }),
      this.ordersService.countOrders({ status: OrderStatus.Processing }),
      this.ordersService.countOrders({ status: OrderStatus.Shipped }),
      this.ordersService.countOrders({ status: OrderStatus.Delivered }),
      this.ordersService.countOrders({ status: OrderStatus.Completed }),
      this.ordersService.countOrders({ status: OrderStatus.Cancelled }),
      this.ordersService.countOrders({ status: OrderStatus.Refunded }),
      // Revenue
      this.ordersService.calculateRevenue(),
      // Reviews
      this.reviewModel.countDocuments({}).exec(),
    ]);

    // Convert aggregation results to maps
    const roleMap: Record<string, number> = {};
    for (const r of usersByRole) {
      roleMap[r._id] = r.count;
    }
    const planMap: Record<string, number> = {};
    for (const p of creatorsByPlan) {
      planMap[p._id] = p.count;
    }

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        byRole: {
          user: roleMap[UserRole.User] || 0,
          creator: roleMap[UserRole.Creator] || 0,
          admin: roleMap[UserRole.Admin] || 0,
          super_admin: roleMap[UserRole.SuperAdmin] || 0,
        },
      },
      creators: {
        total: totalCreators,
        active: activeCreators,
        suspended: suspendedCreators,
        verified: verifiedCreators,
        byPlan: {
          starter: planMap[CreatorPlan.Starter] || 0,
          pro: planMap[CreatorPlan.Pro] || 0,
          business: planMap[CreatorPlan.Business] || 0,
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

  // ═══════════════════════════════════════════════════════════
  // STORE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * List all stores with pagination (admin view - no visibility filter).
   */
  async listStores(
    page: number = 1,
    perPage: number = 20,
    status?: string,
    search?: string,
  ): Promise<PaginatedResponse<StoreDocument>> {
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
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

  /**
   * Update store status (suspend, activate, etc.)
   */
  async updateStoreStatus(storeId: string, status: StoreStatus) {
    const store = await this.storeModel
      .findByIdAndUpdate(storeId, { $set: { status } }, { new: true })
      .exec();

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  // ═══════════════════════════════════════════════════════════
  // REVIEW MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * List all reviews with pagination (admin view - includes hidden).
   */
  async listReviews(
    page: number = 1,
    perPage: number = 20,
    search?: string,
    anonymous?: string,
    creatorId?: string,
    storeId?: string,
  ): Promise<PaginatedResponse<ReviewDocument>> {
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { reviewerName: { $regex: search, $options: 'i' } },
      ];
    }
    if (anonymous === 'true') filter.reviewerId = null;
    else if (anonymous === 'false') filter.reviewerId = { $ne: null };
    if (creatorId) filter.creatorId = new Types.ObjectId(creatorId);
    if (storeId) filter.storeId = new Types.ObjectId(storeId);

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

  /**
   * Delete a single review.
   */
  async deleteReview(reviewId: string) {
    const review = await this.reviewModel.findByIdAndDelete(reviewId).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return { deleted: true };
  }

  /**
   * Bulk delete reviews.
   */
  async bulkDeleteReviews(reviewIds: string[]) {
    const result = await this.reviewModel
      .deleteMany({ _id: { $in: reviewIds.map((id) => new Types.ObjectId(id)) } })
      .exec();
    return { deleted: result.deletedCount };
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Invite a new admin by email. Creates user with temp password, sends invite email.
   */
  async inviteAdmin(email: string, role: UserRole, invitedBy: string) {
    // Check if user already exists
    const existing = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (existing) {
      // If exists but not admin, upgrade role
      if (existing.role !== UserRole.Admin && existing.role !== UserRole.SuperAdmin) {
        existing.role = role;
        await existing.save();
        return { message: 'Existing user promoted to admin', userId: existing._id };
      }
      throw new BadRequestException('This email is already an admin');
    }

    // Generate temporary password
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user
    const user = await this.userModel.create({
      firstName: 'Admin',
      lastName: 'User',
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isEmailVerified: true,
      authProvider: 'local',
    });

    // Send invite email
    try {
      await this.notificationsService.sendRawEmail(
        email,
        'You have been invited as an Admin on Comaket',
        `<h2>Welcome to Comaket Admin</h2>
         <p>You have been invited as a <strong>${role === UserRole.SuperAdmin ? 'Super Admin' : 'Admin'}</strong>.</p>
         <p>Here are your login credentials:</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Temporary Password:</strong> ${tempPassword}</p>
         <p>Please login and change your password immediately.</p>`,
      );
    } catch (err) {
      // Don't fail if email fails
    }

    return { message: 'Admin invited successfully', userId: user._id };
  }

  /**
   * Resend invite email to an admin.
   */
  async resendAdminInvite(adminId: string) {
    const admin = await this.userModel.findById(adminId).exec();
    if (!admin) throw new NotFoundException('Admin not found');
    if (admin.role !== UserRole.Admin && admin.role !== UserRole.SuperAdmin) {
      throw new BadRequestException('User is not an admin');
    }

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    try {
      await this.notificationsService.sendRawEmail(
        admin.email,
        'Comaket Admin - New Login Credentials',
        `<h2>New Login Credentials</h2>
         <p>Your admin credentials have been reset:</p>
         <p><strong>Email:</strong> ${admin.email}</p>
         <p><strong>New Temporary Password:</strong> ${tempPassword}</p>
         <p>Please login and change your password.</p>`,
      );
    } catch (err) {
      // Don't fail if email fails
    }

    return { message: 'Invite resent' };
  }

  /**
   * Remove an admin (super_admin only). Cannot remove super_admins.
   */
  async removeAdmin(adminId: string, requesterId: string) {
    const admin = await this.userModel.findById(adminId).exec();
    if (!admin) throw new NotFoundException('Admin not found');

    if (admin.role === UserRole.SuperAdmin) {
      throw new BadRequestException('Cannot remove a super admin');
    }

    if (admin._id.toString() === requesterId) {
      throw new BadRequestException('Cannot remove yourself');
    }

    // Downgrade to regular user
    admin.role = UserRole.User;
    await admin.save();

    return { message: 'Admin removed' };
  }

  /**
   * List all admins.
   */
  async listAdmins() {
    return this.userModel
      .find({ role: { $in: [UserRole.Admin, UserRole.SuperAdmin] } })
      .select('firstName lastName email role avatar createdAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN CREATE LISTING (Kraft_official store, straight to live)
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /admin/listings/create
   *
   * Creates a listing under the official Kraft_official store.
   * Skips the review process — listing goes straight to 'live' status.
   */
  async adminCreateListing(
    dto: AdminCreateListingDto,
    adminUserId: string,
  ): Promise<ListingDocument> {
    // Find the Kraft_official store
    const store = await this.storeModel
      .findOne({ slug: 'kraft-official' })
      .exec();

    if (!store) {
      throw new NotFoundException(
        'Kraft_official store not found. Please run the seed script first.',
      );
    }

    // Build admin pricing if provided
    const adminPricing: Record<string, any> = {};
    if (dto.sellingPrice != null) adminPricing.sellingPrice = dto.sellingPrice;
    if (dto.commissionRate != null) adminPricing.commissionRate = dto.commissionRate;

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
      status: ListingStatus.Live,
      reviewInfo: {
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        adminNotes: 'Admin-created listing — bypassed review.',
      },
      ...(Object.keys(adminPricing).length > 0 ? { adminPricing } : {}),
    });

    const saved = await listing.save();

    // Increment store listing count
    await this.storeModel
      .findByIdAndUpdate(store._id, { $inc: { totalListings: 1 } })
      .exec();

    return saved;
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
