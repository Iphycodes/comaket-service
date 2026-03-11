/**
 * creators/creators.service.ts - Creator Business Logic
 * ========================================================
 * Handles everything related to creator profiles:
 * - Upgrading a user to a creator (the "Become a Creator" flow)
 * - Updating creator profiles
 * - Querying/searching creators for the marketplace
 * - Managing bank details for payouts
 *
 * IMPORTANT: A Creator is a PERSONAL profile (username, bio, industries).
 * Business details (businessName, address) live on Stores.
 *
 * SLUG GENERATION:
 * When a creator registers with username "emeka_tech",
 * we generate a URL-friendly slug: "emeka-tech".
 * If that's taken, we append a random suffix: "emeka-tech-a3f2".
 * This slug is used in URLs: comaket.com/creators/emeka-tech
 *
 * THE USER → CREATOR UPGRADE:
 * When a user becomes a creator, three things happen:
 * 1. A Creator document is created (this service)
 * 2. The User's role is updated from 'user' to 'creator' (via UsersService)
 * 3. The User's firstName/lastName are updated if provided
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Creator, CreatorDocument } from './schemas/creator.schema';
import { UsersService } from '../users/users.service';
import {
  BecomeCreatorDto,
  UpdateCreatorDto,
  BankDetailsDto,
  QueryCreatorsDto,
} from './dto/creator.dto';
import { UserRole, CreatorStatus, CreatorPlan } from '@config/contants';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    private usersService: UsersService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────

  /**
   * Generate a URL-friendly slug from a username.
   * "emeka_tech" → "emeka-tech"
   * If the slug already exists, append a random 4-char suffix.
   */
  private async generateUniqueSlug(username: string): Promise<string> {
    let slug = username
      .toLowerCase()
      .replace(/\s+/g, '-') // Spaces → hyphens
      .replace(/[^a-z0-9_-]/g, '') // Keep letters, numbers, underscores, hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens

    // Check if slug is taken
    const existing = await this.creatorModel.findOne({ slug }).exec();
    if (existing) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${suffix}`;
    }

    return slug;
  }

  /**
   * Map planId string to CreatorPlan enum.
   */
  private resolvePlan(planId?: string): CreatorPlan {
    if (!planId) return CreatorPlan.Starter;
    const planMap: Record<string, CreatorPlan> = {
      starter: CreatorPlan.Starter,
      pro: CreatorPlan.Pro,
      business: CreatorPlan.Business,
    };
    return planMap[planId.toLowerCase()] || CreatorPlan.Starter;
  }

  // ─── Become a Creator ────────────────────────────────────

  /**
   * POST /creators/become
   *
   * The core upgrade flow:
   * 1. Check user isn't already a creator
   * 2. Check username isn't taken
   * 3. Generate a unique slug from username
   * 4. Create the Creator document
   * 5. Update the User's role to 'creator' + firstName/lastName if provided
   * 6. Return the new creator profile
   */
  async becomeCreator(
    userId: string,
    becomeCreatorDto: BecomeCreatorDto,
  ): Promise<CreatorDocument> {
    // Check if user already has a creator profile
    const existingCreator = await this.creatorModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (existingCreator) {
      throw new ConflictException('You already have a creator profile');
    }

    // Check if username is taken
    const existingUsername = await this.creatorModel
      .findOne({ username: becomeCreatorDto.username })
      .exec();

    if (existingUsername) {
      throw new ConflictException(
        `Username "${becomeCreatorDto.username}" is already taken`,
      );
    }

    // Generate URL slug from username
    const slug = await this.generateUniqueSlug(becomeCreatorDto.username);

    // Extract user-level fields (these update the User, not the Creator)
    const { firstName, lastName, planId, ...creatorFields } = becomeCreatorDto;

    // Create the creator document
    const creator = new this.creatorModel({
      userId: new Types.ObjectId(userId),
      ...creatorFields,
      slug,
      plan: this.resolvePlan(planId),
      status: CreatorStatus.Active,
    });

    const savedCreator = await creator.save();

    // Update the user's role to 'creator' + name if provided
    const userUpdate: Record<string, any> = { role: UserRole.Creator };
    if (firstName) userUpdate.firstName = firstName;
    if (lastName) userUpdate.lastName = lastName;

    await this.usersService.updateInternal(userId, userUpdate);

    return savedCreator;
  }

  // ─── Check Username Availability ───────────────────────

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const existing = await this.creatorModel
      .findOne({ username: username.trim() })
      .select('_id')
      .lean()
      .exec();

    return { available: !existing };
  }

  // ─── Get Creator Profile ─────────────────────────────────

  /**
   * Get creator profile by the creator's MongoDB _id.
   * .populate('userId') replaces the ObjectId with the full User document.
   */
  async findById(creatorId: string): Promise<CreatorDocument> {
    const creator = await this.creatorModel
      .findById(creatorId)
      .populate('userId', 'firstName lastName email avatar')
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  /**
   * Get creator profile by the linked User's _id.
   * Used when the logged-in user wants to see their OWN creator profile.
   */
  async findByUserId(userId: string): Promise<CreatorDocument> {
    const creator = await this.creatorModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'firstName lastName email avatar')
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    return creator;
  }

  /**
   * Get creator by slug — used for public profile pages.
   * URL: comaket.com/creators/emeka-tech
   */
  async findBySlug(slug: string): Promise<CreatorDocument> {
    // Escape special regex characters to prevent injection
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Exact match on slug or username (case-insensitive)
    const creator = await this.creatorModel
      .findOne({
        $or: [
          { slug: slug.toLowerCase(), status: CreatorStatus.Active },
          {
            username: { $regex: new RegExp(`^${escaped}$`, 'i') },
            status: CreatorStatus.Active,
          },
        ],
      })
      .populate('userId', 'firstName lastName email avatar')
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  // ─── Update Creator Profile ──────────────────────────────

  /**
   * Update creator profile. Only the creator themselves can do this.
   *
   * Special handling:
   * - username change → regenerate slug + check uniqueness
   * - firstName/lastName → update the User record too
   */
  async updateProfile(
    userId: string,
    updateCreatorDto: UpdateCreatorDto,
  ): Promise<CreatorDocument> {
    const creator = await this.creatorModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    // If username changed, check uniqueness and regenerate slug
    if (
      updateCreatorDto.username &&
      updateCreatorDto.username !== creator.username
    ) {
      const existingUsername = await this.creatorModel
        .findOne({
          username: updateCreatorDto.username,
          _id: { $ne: creator._id },
        })
        .exec();

      if (existingUsername) {
        throw new ConflictException(
          `Username "${updateCreatorDto.username}" is already taken`,
        );
      }

      const newSlug = await this.generateUniqueSlug(updateCreatorDto.username);
      (updateCreatorDto as any).slug = newSlug;
    }

    // Validate featured works — only Pro and Business can have them
    if (
      updateCreatorDto.featuredWorks?.length > 0 &&
      creator.plan === CreatorPlan.Starter
    ) {
      throw new BadRequestException(
        'Featured works are available on Pro and Business plans. Please upgrade your plan.',
      );
    }

    // Extract user-level fields
    const { firstName, lastName, planId, ...creatorFields } = updateCreatorDto;

    // Update user's name if provided
    if (firstName || lastName) {
      const userUpdate: Record<string, any> = {};
      if (firstName) userUpdate.firstName = firstName;
      if (lastName) userUpdate.lastName = lastName;
      await this.usersService.updateInternal(userId, userUpdate);
    }

    // Resolve plan if provided
    if (planId) {
      (creatorFields as any).plan = this.resolvePlan(planId);
    }

    Object.assign(creator, creatorFields);
    return creator.save();
  }

  // ─── Bank Details ────────────────────────────────────────

  /**
   * Update bank details for payouts.
   */
  async updateBankDetails(
    userId: string,
    bankDetailsDto: BankDetailsDto,
  ): Promise<CreatorDocument> {
    const creator = await this.creatorModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: { bankDetails: bankDetailsDto } },
        { new: true },
      )
      .exec();

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    return creator;
  }

  // ─── Query Creators (Marketplace) ────────────────────────

  /**
   * Browse/search creators on the marketplace.
   * Supports filtering by status, plan, industry, verification,
   * plus full-text search on username and bio.
   */
  async findAll(
    queryDto: QueryCreatorsDto,
  ): Promise<PaginatedResponse<CreatorDocument>> {
    const {
      page,
      perPage,
      sort,
      search,
      status,
      plan,
      industry,
      state,
      city,
      isVerified,
    } = queryDto;

    const filter: Record<string, any> = {};

    // Default: only show active creators
    filter.status = status || CreatorStatus.Active;

    if (plan) filter.plan = plan;
    if (industry) filter.industries = industry; // MongoDB matches if array contains the value
    if (state) filter['location.state'] = { $regex: state, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (isVerified !== undefined) filter.isVerified = isVerified;

    // Search on username, bio, industries, tags, AND owner's first/last name
    if (search) {
      // Find users whose name matches the search term
      const matchingUsers = await this.creatorModel.db
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

      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { industries: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
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
      this.creatorModel
        .find(filter)
        .populate('userId', 'firstName lastName avatar')
        .sort(sortObj)
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

  // ─── Stats Helpers ───────────────────────────────────────

  async updateStats(
    creatorId: string,
    field: string,
    amount: number,
  ): Promise<void> {
    await this.creatorModel
      .findByIdAndUpdate(creatorId, { $inc: { [field]: amount } })
      .exec();
  }

  async countCreators(filter: Record<string, any> = {}): Promise<number> {
    return this.creatorModel.countDocuments(filter).exec();
  }
}
