/**
 * stores/stores.service.ts - Store Business Logic
 * ==================================================
 * Handles all store operations:
 * - Creating a store (under a creator)
 * - Updating store details
 * - Querying stores (by creator, by slug, marketplace browsing)
 * - Enforcing plan-based limits (Starter = max 1 store, etc.)
 *
 * PLAN-BASED STORE LIMITS:
 *   Starter (free): 1 store
 *   Pro (₦3,000/mo): 3 stores
 *   Business (₦8,000/mo): Unlimited stores
 *
 * OWNERSHIP CHECK PATTERN:
 * When a creator updates/deletes a store, we verify they OWN it
 * by checking store.userId matches the JWT user's ID. This prevents
 * creators from modifying each other's stores.
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store, StoreDocument } from './schemas/store.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { CreatorsService } from '../creators/creators.service';
import {
  CreateStoreDto,
  UpdateStoreDto,
  QueryStoresDto,
} from './dto/store.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CreatorPlan, StoreStatus } from '@config/contants';

// Store limits per plan
const STORE_LIMITS: Record<string, number> = {
  [CreatorPlan.Starter]: 1,
  [CreatorPlan.Pro]: 3,
  [CreatorPlan.Business]: Infinity,
};

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    private creatorsService: CreatorsService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────

  /**
   * Generate a unique slug from store name, same approach as Creator.
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const existing = await this.storeModel.findOne({ slug }).exec();
    if (existing) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${suffix}`;
    }

    return slug;
  }

  /**
   * Verify that a store belongs to the given user.
   * Used before any update/delete to prevent unauthorized access.
   */
  private async verifyOwnership(
    storeId: string,
    userId: string,
  ): Promise<StoreDocument> {
    const store = await this.storeModel.findById(storeId).exec();

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (
      ((store.userId as any)?._id?.toString() || store.userId?.toString()) !==
      userId
    ) {
      throw new ForbiddenException('You do not own this store');
    }

    return store;
  }

  // ─── Create Store ────────────────────────────────────────

  /**
   * POST /stores
   *
   * Flow:
   * 1. Find the creator profile for this user
   * 2. Check store limit based on their plan
   * 3. Generate unique slug
   * 4. Create the store
   * 5. Increment creator's totalStores counter
   */
  async create(
    userId: string,
    createStoreDto: CreateStoreDto,
  ): Promise<StoreDocument> {
    // Get the creator profile — this also verifies the user IS a creator
    const creator = await this.creatorsService.findByUserId(userId);

    // Check plan-based store limits
    const storeLimit = STORE_LIMITS[creator.plan] ?? 1;
    const currentStoreCount = await this.storeModel.countDocuments({
      creatorId: creator._id,
      status: { $ne: StoreStatus.Closed }, // Don't count closed stores
    });

    if (currentStoreCount >= storeLimit) {
      throw new BadRequestException(
        `Your ${creator.plan} plan allows a maximum of ${storeLimit} store(s). ` +
          `Please upgrade your plan to create more stores.`,
      );
    }

    // Generate slug
    const slug = await this.generateUniqueSlug(createStoreDto.name);

    // Create the store document
    const store = new this.storeModel({
      ...createStoreDto,
      slug,
      creatorId: creator._id,
      userId: new Types.ObjectId(userId),
      status: StoreStatus.Active,
    });

    const savedStore = await store.save();

    // Update creator stats
    await this.creatorsService.updateStats(
      creator._id.toString(),
      'totalStores',
      1,
    );

    return savedStore;
  }

  // ─── Get Store ───────────────────────────────────────────

  /**
   * Find store by ID with creator and user info populated.
   */
  async findById(storeId: string): Promise<StoreDocument> {
    const store = await this.storeModel
      .findById(storeId)
      .populate({
        path: 'creatorId',
        select: 'businessName slug logo isVerified',
      })
      .populate('userId', 'firstName lastName avatar')
      .exec();

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /**
   * Find store by slug — used for public store pages.
   * URL: comaket.com/stores/johns-clothing
   */
  async findBySlug(slug: string): Promise<StoreDocument> {
    const store = await this.storeModel
      .findOne({ slug, status: StoreStatus.Active })
      .populate({
        path: 'creatorId',
        select: 'businessName slug logo isVerified whatsappNumber',
      })
      .populate('userId', 'firstName lastName avatar')
      .exec();

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  // ─── My Stores (Creator's own stores) ────────────────────

  /**
   * Get all stores belonging to the authenticated creator.
   * Used on the creator dashboard / store management page.
   */
  async findMyStores(userId: string): Promise<StoreDocument[]> {
    return this.storeModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ─── Stores by Creator ──────────────────────────────────

  /**
   * Get all active stores by a specific creator.
   * Used on the public creator profile page to show their stores.
   */
  async findByCreatorId(creatorId: string): Promise<StoreDocument[]> {
    return this.storeModel
      .find({
        creatorId: new Types.ObjectId(creatorId),
        status: StoreStatus.Active,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ─── Update Store ────────────────────────────────────────

  /**
   * Update a store. Verifies ownership first.
   * If the name changes, regenerates the slug.
   */
  async update(
    storeId: string,
    userId: string,
    updateStoreDto: UpdateStoreDto,
  ): Promise<StoreDocument> {
    const store = await this.verifyOwnership(storeId, userId);

    // Map "bio" to "description" (frontend alias)
    if ((updateStoreDto as any).bio !== undefined) {
      updateStoreDto.description = (updateStoreDto as any).bio;
      delete (updateStoreDto as any).bio;
    }

    // Strip Mongoose _id/id from nested objects (frontend may include them)
    if (updateStoreDto.operatingHours) {
      const { _id, id, ...cleanHours } = updateStoreDto.operatingHours as any;
      updateStoreDto.operatingHours = cleanHours;
    }
    if (updateStoreDto.bankDetails) {
      const { _id, id, ...cleanBank } = updateStoreDto.bankDetails as any;
      updateStoreDto.bankDetails = cleanBank;
    }
    if ((updateStoreDto as any).socialLinks) {
      const { _id, id, ...cleanSocial } = (updateStoreDto as any).socialLinks;
      (updateStoreDto as any).socialLinks = cleanSocial;
    }
    if ((updateStoreDto as any).notifications) {
      const { _id, id, ...cleanNotifs } = (updateStoreDto as any).notifications;
      (updateStoreDto as any).notifications = cleanNotifs;
    }

    // Regenerate slug if name changed
    if (updateStoreDto.name && updateStoreDto.name !== store.name) {
      (updateStoreDto as any).slug = await this.generateUniqueSlug(
        updateStoreDto.name,
      );
    }

    Object.assign(store, updateStoreDto);
    return store.save();
  }

  // ─── Toggle Visibility ─────────────────────────────────

  /**
   * Owner toggles store visibility on/off.
   * Hidden stores don't appear in marketplace browse or search.
   */
  async toggleVisibility(
    storeId: string,
    userId: string,
  ): Promise<{ isVisible: boolean }> {
    const store = await this.verifyOwnership(storeId, userId);

    store.isVisible = !store.isVisible;
    await store.save();

    return { isVisible: store.isVisible };
  }

  // ─── Close Store ─────────────────────────────────────────

  /**
   * "Close" a store — soft close, not delete.
   * The store stays in the database but becomes inactive.
   * Listings under this store should also be deactivated (handled later).
   */
  async closeStore(storeId: string, userId: string): Promise<StoreDocument> {
    const store = await this.verifyOwnership(storeId, userId);

    store.status = StoreStatus.Closed;
    const closedStore = await store.save();

    // Decrement creator's totalStores counter
    await this.creatorsService.updateStats(
      store.creatorId.toString(),
      'totalStores',
      -1,
    );

    return closedStore;
  }

  // ─── Browse Stores (Marketplace) ─────────────────────────

  /**
   * Browse/search stores on the marketplace.
   * Supports filtering by category, creator, status, and text search.
   */
  async findAll(
    queryDto: QueryStoresDto,
  ): Promise<PaginatedResponse<StoreDocument>> {
    const {
      page,
      perPage,
      sort,
      search,
      status,
      category,
      state,
      city,
      creatorId,
    } = queryDto;

    const filter: Record<string, any> = {};

    // Default: only active, visible stores
    filter.status = status || StoreStatus.Active;
    filter.isVisible = true;

    if (category) filter.categories = category; // Matches any store with this in their categories array
    if (state) filter['location.state'] = { $regex: state, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (creatorId) filter.creatorId = new Types.ObjectId(creatorId);

    // Text search on name, description, tags, creator username, AND owner's first/last name
    if (search) {
      // Find users whose name matches the search term
      const matchingUsers = await this.storeModel.db
        .collection('users')
        .find({
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
          ],
        })
        .project({ _id: 1 })
        .toArray();

      const matchingUserIds = matchingUsers.map((u) => u._id);

      // Also find creators matching username
      const matchingCreators = await this.creatorModel
        .find({
          $or: [
            { username: { $regex: search, $options: 'i' } },
            ...(matchingUserIds.length
              ? [{ userId: { $in: matchingUserIds } }]
              : []),
          ],
        })
        .select('_id')
        .lean()
        .exec();

      const creatorIds = matchingCreators.map((c) => c._id);

      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
        ...(creatorIds.length ? [{ creatorId: { $in: creatorIds } }] : []),
        ...(matchingUserIds.length
          ? [{ userId: { $in: matchingUserIds } }]
          : []),
      ];
    }

    // Parse sort
    const sortObj: Record<string, 1 | -1> = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.storeModel
        .find(filter)
        .populate({
          path: 'creatorId',
          select: 'username businessName slug logo isVerified',
        })
        .sort(sortObj)
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

  // ─── Stats Helpers ───────────────────────────────────────

  /**
   * Update store stats. Called by listings/orders services.
   */
  async updateStats(
    storeId: string,
    field: string,
    amount: number,
  ): Promise<void> {
    await this.storeModel
      .findByIdAndUpdate(storeId, { $inc: { [field]: amount } })
      .exec();
  }

  /**
   * Count stores — used by admin dashboard.
   */
  async countStores(filter: Record<string, any> = {}): Promise<number> {
    return this.storeModel.countDocuments(filter).exec();
  }
}