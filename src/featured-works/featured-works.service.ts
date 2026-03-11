/**
 * featured-works/featured-works.service.ts
 * ==========================================
 * Full CRUD for featured works (portfolio/showcase items).
 *
 * PLAN ENFORCEMENT:
 *   Starter: 0 works (feature not available)
 *   Pro: up to 10
 *   Business: up to 25
 *
 * OWNERSHIP:
 *   Only the creator/store owner can manage featured works.
 *   We verify via userId on both the owner entity and each work.
 *
 * ORDERING:
 *   Each work has a `position` field (0-indexed).
 *   New works go to the end. Reorder endpoint sets positions in bulk.
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FeaturedWork,
  FeaturedWorkDocument,
  FeaturedWorkOwnerType,
} from './schema/featured-works.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import {
  CreateFeaturedWorkDto,
  UpdateFeaturedWorkDto,
  ReorderFeaturedWorksDto,
  QueryFeaturedWorksDto,
} from './dto/featured-works.dto';
import { CreatorPlan, PLAN_LIMITS } from '@config/contants';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class FeaturedWorksService {
  constructor(
    @InjectModel(FeaturedWork.name)
    private featuredWorkModel: Model<FeaturedWorkDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  // ─── Create ──────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateFeaturedWorkDto,
  ): Promise<FeaturedWorkDocument> {
    const { ownerType, ownerId, images, title, description } = dto;

    // Verify ownership and get plan
    const plan = await this.verifyOwnershipAndGetPlan(
      userId,
      ownerType,
      ownerId,
    );

    // Check plan limits
    const limit = PLAN_LIMITS.featuredWorks[plan];
    if (limit === 0) {
      throw new BadRequestException(
        'Featured works are not available on the Starter plan. Please upgrade to Pro or Business.',
      );
    }

    const currentCount = await this.featuredWorkModel
      .countDocuments({ ownerType, ownerId: new Types.ObjectId(ownerId) })
      .exec();

    if (currentCount >= limit) {
      throw new BadRequestException(
        `You've reached the maximum of ${limit} featured works for your ${plan} plan.`,
      );
    }

    // Set position to the end
    const position = currentCount;

    const work = new this.featuredWorkModel({
      userId: new Types.ObjectId(userId),
      ownerType,
      ownerId: new Types.ObjectId(ownerId),
      images,
      title: title || null,
      description: description || null,
      position,
    });

    const saved = await work.save();

    // Sync the array on the parent document
    await this.syncParentArray(ownerType, ownerId);

    return saved;
  }

  // ─── Update ──────────────────────────────────────────────

  async update(
    userId: string,
    workId: string,
    dto: UpdateFeaturedWorkDto,
  ): Promise<FeaturedWorkDocument> {
    const work = await this.featuredWorkModel.findById(workId).exec();
    if (!work) {
      throw new NotFoundException('Featured work not found');
    }

    // Verify ownership
    if (work.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update your own featured works',
      );
    }

    let imagesChanged = false;

    // Replace entire images array
    if (dto.images !== undefined) {
      work.images = dto.images;
      imagesChanged = true;
    }

    // Add images to existing array
    if (dto.addImages?.length) {
      work.images = [...work.images, ...dto.addImages];
      imagesChanged = true;
    }

    // Remove specific images
    if (dto.removeImages?.length) {
      work.images = work.images.filter(
        (url) => !dto.removeImages.includes(url),
      );
      imagesChanged = true;
    }

    if (dto.title !== undefined) work.title = dto.title || null;
    if (dto.description !== undefined)
      work.description = dto.description || null;

    const saved = await work.save();

    if (imagesChanged) {
      await this.syncParentArray(work.ownerType, work.ownerId.toString());
    }

    return saved;
  }

  // ─── Delete Single ───────────────────────────────────────

  async remove(userId: string, workId: string): Promise<{ deleted: true }> {
    const work = await this.featuredWorkModel.findById(workId).exec();
    if (!work) {
      throw new NotFoundException('Featured work not found');
    }

    if (work.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You can only delete your own featured works',
      );
    }

    const { ownerType, ownerId, position } = work;
    await this.featuredWorkModel.deleteOne({ _id: work._id }).exec();

    // Shift positions down for items after the deleted one
    await this.featuredWorkModel
      .updateMany(
        {
          ownerType,
          ownerId,
          position: { $gt: position },
        },
        { $inc: { position: -1 } },
      )
      .exec();

    // Sync parent array
    await this.syncParentArray(ownerType, ownerId.toString());

    return { deleted: true };
  }

  // ─── Delete All for Owner ────────────────────────────────

  async removeAll(
    userId: string,
    ownerType: FeaturedWorkOwnerType,
    ownerId: string,
  ): Promise<{ deletedCount: number }> {
    await this.verifyOwnershipAndGetPlan(userId, ownerType, ownerId);

    const result = await this.featuredWorkModel
      .deleteMany({
        ownerType,
        ownerId: new Types.ObjectId(ownerId),
      })
      .exec();

    // Clear parent array
    await this.syncParentArray(ownerType, ownerId);

    return { deletedCount: result.deletedCount };
  }

  // ─── Reorder ─────────────────────────────────────────────

  async reorder(
    userId: string,
    dto: ReorderFeaturedWorksDto,
  ): Promise<FeaturedWorkDocument[]> {
    const { ownerType, ownerId, orderedIds } = dto;

    await this.verifyOwnershipAndGetPlan(userId, ownerType, ownerId);

    // Bulk update positions
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(id),
          ownerType,
          ownerId: new Types.ObjectId(ownerId),
        },
        update: { $set: { position: index } },
      },
    }));

    await this.featuredWorkModel.bulkWrite(bulkOps);

    // Sync parent array in new order
    await this.syncParentArray(ownerType, ownerId);

    // Return updated list
    return this.featuredWorkModel
      .find({ ownerType, ownerId: new Types.ObjectId(ownerId) })
      .sort({ position: 1 })
      .exec();
  }

  // ─── Find by Owner (Public) ──────────────────────────────

  async findByOwner(
    queryDto: QueryFeaturedWorksDto,
  ): Promise<PaginatedResponse<FeaturedWorkDocument>> {
    const { ownerType, ownerId, page, perPage } = queryDto;

    const filter = {
      ownerType,
      ownerId: new Types.ObjectId(ownerId),
    };

    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.featuredWorkModel
        .find(filter)
        .sort({ position: 1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.featuredWorkModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  // ─── Find by ID ──────────────────────────────────────────

  async findById(workId: string): Promise<FeaturedWorkDocument> {
    const work = await this.featuredWorkModel.findById(workId).exec();
    if (!work) {
      throw new NotFoundException('Featured work not found');
    }
    return work;
  }

  // ─── Count for Owner ─────────────────────────────────────

  async countByOwner(
    ownerType: FeaturedWorkOwnerType,
    ownerId: string,
  ): Promise<{ count: number; limit: number; plan: CreatorPlan }> {
    // Get the creator plan (stores inherit from their creator)
    const plan = await this.getOwnerPlan(ownerType, ownerId);
    const limit = PLAN_LIMITS.featuredWorks[plan];

    const count = await this.featuredWorkModel
      .countDocuments({ ownerType, ownerId: new Types.ObjectId(ownerId) })
      .exec();

    return { count, limit, plan };
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Verify the user owns the target entity and return the creator plan.
   * Stores inherit the plan from their creator.
   */
  private async verifyOwnershipAndGetPlan(
    userId: string,
    ownerType: FeaturedWorkOwnerType,
    ownerId: string,
  ): Promise<CreatorPlan> {
    if (ownerType === FeaturedWorkOwnerType.Creator) {
      const creator = await this.creatorModel
        .findById(ownerId)
        .select('userId plan')
        .lean()
        .exec();

      if (!creator) throw new NotFoundException('Creator not found');
      if (creator.userId.toString() !== userId) {
        throw new ForbiddenException(
          'You can only manage your own featured works',
        );
      }

      return creator.plan as CreatorPlan;
    } else {
      const store = await this.storeModel
        .findById(ownerId)
        .select('userId creatorId')
        .lean()
        .exec();

      if (!store) throw new NotFoundException('Store not found');
      if (
        ((store.userId as any)?._id?.toString() || store.userId?.toString()) !==
        userId
      ) {
        throw new ForbiddenException(
          'You can only manage your own featured works',
        );
      }

      // Get plan from the store's creator
      const creator = await this.creatorModel
        .findById(store.creatorId)
        .select('plan')
        .lean()
        .exec();

      return (creator?.plan as CreatorPlan) || CreatorPlan.Starter;
    }
  }

  /**
   * Get the creator plan for a given owner. Stores inherit from their creator.
   */
  private async getOwnerPlan(
    ownerType: FeaturedWorkOwnerType,
    ownerId: string,
  ): Promise<CreatorPlan> {
    if (ownerType === FeaturedWorkOwnerType.Creator) {
      const creator = await this.creatorModel
        .findById(ownerId)
        .select('plan')
        .lean()
        .exec();
      return (creator?.plan as CreatorPlan) || CreatorPlan.Starter;
    } else {
      const store = await this.storeModel
        .findById(ownerId)
        .select('creatorId')
        .lean()
        .exec();
      if (!store) return CreatorPlan.Starter;

      const creator = await this.creatorModel
        .findById(store.creatorId)
        .select('plan')
        .lean()
        .exec();
      return (creator?.plan as CreatorPlan) || CreatorPlan.Starter;
    }
  }

  /**
   * Sync the featuredWorks string array on the parent Creator/Store document.
   * Flattens all images from all featured works into one array.
   */
  private async syncParentArray(
    ownerType: FeaturedWorkOwnerType,
    ownerId: string,
  ): Promise<void> {
    const works = await this.featuredWorkModel
      .find({ ownerType, ownerId: new Types.ObjectId(ownerId) })
      .sort({ position: 1 })
      .select('images')
      .lean()
      .exec();

    const urls = works.flatMap((w) => w.images || []);

    if (ownerType === FeaturedWorkOwnerType.Creator) {
      await this.creatorModel
        .findByIdAndUpdate(ownerId, { $set: { featuredWorks: urls } })
        .exec();
    } else {
      await this.storeModel
        .findByIdAndUpdate(ownerId, { $set: { featuredWorks: urls } })
        .exec();
    }
  }
}
