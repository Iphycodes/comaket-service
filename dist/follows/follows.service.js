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
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const follows_shema_1 = require("./schema/follows.shema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
let FollowsService = class FollowsService {
    constructor(followModel, creatorModel, storeModel) {
        this.followModel = followModel;
        this.creatorModel = creatorModel;
        this.storeModel = storeModel;
    }
    async toggle(userId, dto) {
        const { targetType, targetId } = dto;
        await this.verifyTargetExists(targetType, targetId);
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const targetObjId = new mongoose_2.Types.ObjectId(targetId);
        const existing = await this.followModel
            .findOne({ userId: userObjId, targetType, targetId: targetObjId })
            .exec();
        let followed;
        if (existing) {
            await this.followModel.deleteOne({ _id: existing._id }).exec();
            await this.updateFollowerCount(targetType, targetId, -1);
            followed = false;
        }
        else {
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
    async check(userId, dto) {
        const { targetType, targetIds } = dto;
        const follows = await this.followModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            targetType,
            targetId: { $in: targetIds.map((id) => new mongoose_2.Types.ObjectId(id)) },
        })
            .select('targetId')
            .lean()
            .exec();
        const followedSet = new Set(follows.map((f) => f.targetId.toString()));
        const result = {};
        for (const id of targetIds) {
            result[id] = followedSet.has(id);
        }
        return result;
    }
    async findMyFollows(userId, queryDto) {
        const { page, perPage, targetType } = queryDto;
        const filter = {
            userId: new mongoose_2.Types.ObjectId(userId),
        };
        if (targetType)
            filter.targetType = targetType;
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.followModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .populate({
                path: 'targetId',
                select: 'username slug profileImageUrl isVerified bio totalFollowers name logo description followers',
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
    async findFollowers(targetType, targetId, queryDto) {
        const { page, perPage, search } = queryDto;
        const filter = {
            targetType,
            targetId: new mongoose_2.Types.ObjectId(targetId),
        };
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
        const followerUserIds = follows.map((f) => f.userId?._id || f.userId);
        const creators = await this.creatorModel
            .find({
            userId: { $in: followerUserIds },
            status: 'active',
        })
            .select('userId username slug profileImageUrl isVerified')
            .lean()
            .exec();
        const creatorByUserId = new Map(creators.map((c) => [c.userId.toString(), c]));
        const items = follows.map((follow) => {
            const uid = follow.userId?._id?.toString() || follow.userId?.toString();
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
    async getFollowCount(userId, targetType) {
        const filter = {
            userId: new mongoose_2.Types.ObjectId(userId),
        };
        if (targetType)
            filter.targetType = targetType;
        return this.followModel.countDocuments(filter).exec();
    }
    async verifyTargetExists(targetType, targetId) {
        let exists;
        if (targetType === follows_shema_1.FollowTargetType.Creator) {
            exists = await this.creatorModel
                .findById(targetId)
                .select('_id')
                .lean()
                .exec();
        }
        else {
            exists = await this.storeModel
                .findById(targetId)
                .select('_id')
                .lean()
                .exec();
        }
        if (!exists) {
            throw new common_1.NotFoundException(`${targetType === follows_shema_1.FollowTargetType.Creator ? 'Creator' : 'Store'} not found`);
        }
    }
    async updateFollowerCount(targetType, targetId, amount) {
        if (targetType === follows_shema_1.FollowTargetType.Creator) {
            await this.creatorModel
                .findByIdAndUpdate(targetId, { $inc: { totalFollowers: amount } })
                .exec();
        }
        else {
            await this.storeModel
                .findByIdAndUpdate(targetId, { $inc: { followers: amount } })
                .exec();
        }
    }
    async getFollowerCount(targetType, targetId) {
        if (targetType === follows_shema_1.FollowTargetType.Creator) {
            const creator = await this.creatorModel
                .findById(targetId)
                .select('totalFollowers')
                .lean()
                .exec();
            return creator?.totalFollowers ?? 0;
        }
        else {
            const store = await this.storeModel
                .findById(targetId)
                .select('followers')
                .lean()
                .exec();
            return store?.followers ?? 0;
        }
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(follows_shema_1.Follow.name)),
    __param(1, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __param(2, (0, mongoose_1.InjectModel)(store_schema_1.Store.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FollowsService);
//# sourceMappingURL=follows.service.js.map