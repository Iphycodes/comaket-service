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
exports.FeaturedWorksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const featured_works_schema_1 = require("./schema/featured-works.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const store_schema_1 = require("../stores/schemas/store.schema");
const contants_1 = require("../config/contants");
let FeaturedWorksService = class FeaturedWorksService {
    constructor(featuredWorkModel, creatorModel, storeModel) {
        this.featuredWorkModel = featuredWorkModel;
        this.creatorModel = creatorModel;
        this.storeModel = storeModel;
    }
    async create(userId, dto) {
        const { ownerType, ownerId, images, title, description } = dto;
        const plan = await this.verifyOwnershipAndGetPlan(userId, ownerType, ownerId);
        const limit = contants_1.PLAN_LIMITS.featuredWorks[plan];
        if (limit === 0) {
            throw new common_1.BadRequestException('Featured works are not available on the Starter plan. Please upgrade to Pro or Business.');
        }
        const currentCount = await this.featuredWorkModel
            .countDocuments({ ownerType, ownerId: new mongoose_2.Types.ObjectId(ownerId) })
            .exec();
        if (currentCount >= limit) {
            throw new common_1.BadRequestException(`You've reached the maximum of ${limit} featured works for your ${plan} plan.`);
        }
        const position = currentCount;
        const work = new this.featuredWorkModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            ownerType,
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
            images,
            title: title || null,
            description: description || null,
            position,
        });
        const saved = await work.save();
        await this.syncParentArray(ownerType, ownerId);
        return saved;
    }
    async update(userId, workId, dto) {
        const work = await this.featuredWorkModel.findById(workId).exec();
        if (!work) {
            throw new common_1.NotFoundException('Featured work not found');
        }
        if (work.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only update your own featured works');
        }
        let imagesChanged = false;
        if (dto.images !== undefined) {
            work.images = dto.images;
            imagesChanged = true;
        }
        if (dto.addImages?.length) {
            work.images = [...work.images, ...dto.addImages];
            imagesChanged = true;
        }
        if (dto.removeImages?.length) {
            work.images = work.images.filter((url) => !dto.removeImages.includes(url));
            imagesChanged = true;
        }
        if (dto.title !== undefined)
            work.title = dto.title || null;
        if (dto.description !== undefined)
            work.description = dto.description || null;
        const saved = await work.save();
        if (imagesChanged) {
            await this.syncParentArray(work.ownerType, work.ownerId.toString());
        }
        return saved;
    }
    async remove(userId, workId) {
        const work = await this.featuredWorkModel.findById(workId).exec();
        if (!work) {
            throw new common_1.NotFoundException('Featured work not found');
        }
        if (work.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own featured works');
        }
        const { ownerType, ownerId, position } = work;
        await this.featuredWorkModel.deleteOne({ _id: work._id }).exec();
        await this.featuredWorkModel
            .updateMany({
            ownerType,
            ownerId,
            position: { $gt: position },
        }, { $inc: { position: -1 } })
            .exec();
        await this.syncParentArray(ownerType, ownerId.toString());
        return { deleted: true };
    }
    async removeAll(userId, ownerType, ownerId) {
        await this.verifyOwnershipAndGetPlan(userId, ownerType, ownerId);
        const result = await this.featuredWorkModel
            .deleteMany({
            ownerType,
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
        })
            .exec();
        await this.syncParentArray(ownerType, ownerId);
        return { deletedCount: result.deletedCount };
    }
    async reorder(userId, dto) {
        const { ownerType, ownerId, orderedIds } = dto;
        await this.verifyOwnershipAndGetPlan(userId, ownerType, ownerId);
        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: {
                    _id: new mongoose_2.Types.ObjectId(id),
                    ownerType,
                    ownerId: new mongoose_2.Types.ObjectId(ownerId),
                },
                update: { $set: { position: index } },
            },
        }));
        await this.featuredWorkModel.bulkWrite(bulkOps);
        await this.syncParentArray(ownerType, ownerId);
        return this.featuredWorkModel
            .find({ ownerType, ownerId: new mongoose_2.Types.ObjectId(ownerId) })
            .sort({ position: 1 })
            .exec();
    }
    async findByOwner(queryDto) {
        const { ownerType, ownerId, page, perPage } = queryDto;
        const filter = {
            ownerType,
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
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
    async findById(workId) {
        const work = await this.featuredWorkModel.findById(workId).exec();
        if (!work) {
            throw new common_1.NotFoundException('Featured work not found');
        }
        return work;
    }
    async countByOwner(ownerType, ownerId) {
        const plan = await this.getOwnerPlan(ownerType, ownerId);
        const limit = contants_1.PLAN_LIMITS.featuredWorks[plan];
        const count = await this.featuredWorkModel
            .countDocuments({ ownerType, ownerId: new mongoose_2.Types.ObjectId(ownerId) })
            .exec();
        return { count, limit, plan };
    }
    async verifyOwnershipAndGetPlan(userId, ownerType, ownerId) {
        if (ownerType === featured_works_schema_1.FeaturedWorkOwnerType.Creator) {
            const creator = await this.creatorModel
                .findById(ownerId)
                .select('userId plan')
                .lean()
                .exec();
            if (!creator)
                throw new common_1.NotFoundException('Creator not found');
            if (creator.userId.toString() !== userId) {
                throw new common_1.ForbiddenException('You can only manage your own featured works');
            }
            return creator.plan;
        }
        else {
            const store = await this.storeModel
                .findById(ownerId)
                .select('userId creatorId')
                .lean()
                .exec();
            if (!store)
                throw new common_1.NotFoundException('Store not found');
            if ((store.userId?._id?.toString() || store.userId?.toString()) !==
                userId) {
                throw new common_1.ForbiddenException('You can only manage your own featured works');
            }
            const creator = await this.creatorModel
                .findById(store.creatorId)
                .select('plan')
                .lean()
                .exec();
            return creator?.plan || contants_1.CreatorPlan.Starter;
        }
    }
    async getOwnerPlan(ownerType, ownerId) {
        if (ownerType === featured_works_schema_1.FeaturedWorkOwnerType.Creator) {
            const creator = await this.creatorModel
                .findById(ownerId)
                .select('plan')
                .lean()
                .exec();
            return creator?.plan || contants_1.CreatorPlan.Starter;
        }
        else {
            const store = await this.storeModel
                .findById(ownerId)
                .select('creatorId')
                .lean()
                .exec();
            if (!store)
                return contants_1.CreatorPlan.Starter;
            const creator = await this.creatorModel
                .findById(store.creatorId)
                .select('plan')
                .lean()
                .exec();
            return creator?.plan || contants_1.CreatorPlan.Starter;
        }
    }
    async syncParentArray(ownerType, ownerId) {
        const works = await this.featuredWorkModel
            .find({ ownerType, ownerId: new mongoose_2.Types.ObjectId(ownerId) })
            .sort({ position: 1 })
            .select('images')
            .lean()
            .exec();
        const urls = works.flatMap((w) => w.images || []);
        if (ownerType === featured_works_schema_1.FeaturedWorkOwnerType.Creator) {
            await this.creatorModel
                .findByIdAndUpdate(ownerId, { $set: { featuredWorks: urls } })
                .exec();
        }
        else {
            await this.storeModel
                .findByIdAndUpdate(ownerId, { $set: { featuredWorks: urls } })
                .exec();
        }
    }
};
exports.FeaturedWorksService = FeaturedWorksService;
exports.FeaturedWorksService = FeaturedWorksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(featured_works_schema_1.FeaturedWork.name)),
    __param(1, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __param(2, (0, mongoose_1.InjectModel)(store_schema_1.Store.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FeaturedWorksService);
//# sourceMappingURL=featured-works.service.js.map