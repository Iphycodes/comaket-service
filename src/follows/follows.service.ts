/**
 * follows/follows.service.ts - Follow Business Logic
 * =====================================================
 * Handles following/unfollowing creators and stores.
 *
 * Toggle pattern (same as saved products):
 * - If not following → create follow + increment target's follower count
 * - If already following → delete follow + decrement target's follower count
 *
 * Follower counts are denormalized on Creator.totalFollowers and Store.followers
 * for fast reads (no need to count follows on every profile view).
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Follow,
  FollowDocument,
  FollowTargetType,
} from './schema/follows.shema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import {
  ToggleFollowDto,
  CheckFollowDto,
  QueryFollowsDto,
} from './dto/follows.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  // ─── Toggle Follow ───────────────────────────────────────

  /**
   * Follow or unfollow a creator/store.
   * Returns { followed: true } if now following, { followed: false } if unfollowed.
   */
  async toggle(
    userId: string,
    dto: ToggleFollowDto,
  ): Promise<{ followed: boolean; totalFollowers: number }> {
    const { targetType, targetId } = dto;

    // Verify target exists
    await this.verifyTargetExists(targetType, targetId);

    const userObjId = new Types.ObjectId(userId);
    const targetObjId = new Types.ObjectId(targetId);

    const existing = await this.followModel
      .findOne({ userId: userObjId, targetType, targetId: targetObjId })
      .exec();

    let followed: boolean;

    if (existing) {
      // Unfollow
      await this.followModel.deleteOne({ _id: existing._id }).exec();
      await this.updateFollowerCount(targetType, targetId, -1);
      followed = false;
    } else {
      // Follow
      await this.followModel.create({
        userId: userObjId,
        targetType,
        targetId: targetObjId,
      });
      await this.updateFollowerCount(targetType, targetId, 1);
      followed = true;
    }

    const totalFollowers = await this.getFollowerCount(targetType, targetId);

    return { followed, totalFollowers };
  }

  // ─── Check Follow Status ────────────────────────────────

  /**
   * Check if the user follows one or more targets.
   * Returns a map of targetId → boolean.
   */
  async check(
    userId: string,
    dto: CheckFollowDto,
  ): Promise<Record<string, boolean>> {
    const { targetType, targetIds } = dto;

    const follows = await this.followModel
      .find({
        userId: new Types.ObjectId(userId),
        targetType,
        targetId: { $in: targetIds.map((id) => new Types.ObjectId(id)) },
      })
      .select('targetId')
      .lean()
      .exec();

    const followedSet = new Set(follows.map((f) => f.targetId.toString()));

    const result: Record<string, boolean> = {};
    for (const id of targetIds) {
      result[id] = followedSet.has(id);
    }

    return result;
  }

  // ─── Get My Follows ──────────────────────────────────────

  /**
   * Get all creators/stores the user follows.
   * Optionally filter by targetType.
   */
  async findMyFollows(
    userId: string,
    queryDto: QueryFollowsDto,
  ): Promise<PaginatedResponse<FollowDocument>> {
    const { page, perPage, targetType } = queryDto;

    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (targetType) filter.targetType = targetType;

    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.followModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate({
          path: 'targetId',
          select:
            'username slug profileImageUrl isVerified bio totalFollowers name logo description followers',
        })
        .exec(),
      this.followModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  // ─── Get Followers of a Target ───────────────────────────

  /**
   * Get all followers of a creator or store.
   * Each follower includes creator info if they are a creator
   * (for "follow back" functionality on the frontend).
   * Supports search by follower name.
   */
  async findFollowers(
    targetType: FollowTargetType,
    targetId: string,
    queryDto: QueryFollowsDto,
  ): Promise<PaginatedResponse<any>> {
    const { page, perPage, search } = queryDto;

    const filter: Record<string, any> = {
      targetType,
      targetId: new Types.ObjectId(targetId),
    };

    // If searching, find matching user IDs first then filter follows
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await this.followModel.db
        .collection('users')
        .find({
          $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
        })
        .project({ _id: 1 })
        .toArray();

      const matchingUserIds = matchingUsers.map((u) => u._id);
      filter.userId = { $in: matchingUserIds };
    }

    const skip = (page - 1) * perPage;

    const [follows, total] = await Promise.all([
      this.followModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate('userId', 'firstName lastName avatar')
        .lean()
        .exec(),
      this.followModel.countDocuments(filter).exec(),
    ]);

    // Look up which followers are creators
    const followerUserIds = follows.map((f) => f.userId?._id || f.userId);
    const creators = await this.creatorModel
      .find({
        userId: { $in: followerUserIds },
        status: 'active',
      })
      .select('userId username slug profileImageUrl isVerified')
      .lean()
      .exec();

    // Map userId → creator profile
    const creatorByUserId = new Map(
      creators.map((c) => [c.userId.toString(), c]),
    );

    // Enrich each follow with creator info
    const items = follows.map((follow) => {
      const uid =
        (follow.userId as any)?._id?.toString() || follow.userId?.toString();
      const creator = creatorByUserId.get(uid) || null;

      return {
        ...follow,
        isCreator: !!creator,
        creatorProfile: creator
          ? {
              _id: creator._id,
              username: creator.username,
              slug: creator.slug,
              profileImageUrl: creator.profileImageUrl,
              isVerified: creator.isVerified,
            }
          : null,
      };
    });

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  // ─── Get Follow Count ────────────────────────────────────

  async getFollowCount(
    userId: string,
    targetType?: FollowTargetType,
  ): Promise<number> {
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };
    if (targetType) filter.targetType = targetType;

    return this.followModel.countDocuments(filter).exec();
  }

  // ─── Helpers ─────────────────────────────────────────────

  private async verifyTargetExists(
    targetType: FollowTargetType,
    targetId: string,
  ): Promise<void> {
    let exists: any;

    if (targetType === FollowTargetType.Creator) {
      exists = await this.creatorModel
        .findById(targetId)
        .select('_id')
        .lean()
        .exec();
    } else {
      exists = await this.storeModel
        .findById(targetId)
        .select('_id')
        .lean()
        .exec();
    }

    if (!exists) {
      throw new NotFoundException(
        `${targetType === FollowTargetType.Creator ? 'Creator' : 'Store'} not found`,
      );
    }
  }

  private async updateFollowerCount(
    targetType: FollowTargetType,
    targetId: string,
    amount: number,
  ): Promise<void> {
    if (targetType === FollowTargetType.Creator) {
      await this.creatorModel
        .findByIdAndUpdate(targetId, { $inc: { totalFollowers: amount } })
        .exec();
    } else {
      await this.storeModel
        .findByIdAndUpdate(targetId, { $inc: { followers: amount } })
        .exec();
    }
  }

  private async getFollowerCount(
    targetType: FollowTargetType,
    targetId: string,
  ): Promise<number> {
    if (targetType === FollowTargetType.Creator) {
      const creator = await this.creatorModel
        .findById(targetId)
        .select('totalFollowers')
        .lean()
        .exec();
      return creator?.totalFollowers ?? 0;
    } else {
      const store = await this.storeModel
        .findById(targetId)
        .select('followers')
        .lean()
        .exec();
      return store?.followers ?? 0;
    }
  }
}
