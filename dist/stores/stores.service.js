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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const store_schema_1 = require("./schemas/store.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const creators_service_1 = require("../creators/creators.service");
const contants_1 = require("../config/contants");
const STORE_LIMITS = {
    [contants_1.CreatorPlan.Starter]: 1,
    [contants_1.CreatorPlan.Pro]: 3,
    [contants_1.CreatorPlan.Business]: Infinity,
};
let StoresService = class StoresService {
    constructor(storeModel, creatorModel, creatorsService) {
        this.storeModel = storeModel;
        this.creatorModel = creatorModel;
        this.creatorsService = creatorsService;
    }
    async generateUniqueSlug(name) {
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
    async verifyOwnership(storeId, userId) {
        const store = await this.storeModel.findById(storeId).exec();
        if (!store) {
            throw new common_1.NotFoundException('Store not found');
        }
        if ((store.userId?._id?.toString() || store.userId?.toString()) !==
            userId) {
            throw new common_1.ForbiddenException('You do not own this store');
        }
        return store;
    }
    async create(userId, createStoreDto) {
        const creator = await this.creatorsService.findByUserId(userId);
        const storeLimit = STORE_LIMITS[creator.plan] ?? 1;
        const currentStoreCount = await this.storeModel.countDocuments({
            creatorId: creator._id,
            status: { $ne: contants_1.StoreStatus.Closed },
        });
        if (currentStoreCount >= storeLimit) {
            throw new common_1.BadRequestException(`Your ${creator.plan} plan allows a maximum of ${storeLimit} store(s). ` +
                `Please upgrade your plan to create more stores.`);
        }
        const slug = await this.generateUniqueSlug(createStoreDto.name);
        const store = new this.storeModel({
            ...createStoreDto,
            slug,
            creatorId: creator._id,
            userId: new mongoose_2.Types.ObjectId(userId),
            status: contants_1.StoreStatus.Active,
        });
        const savedStore = await store.save();
        await this.creatorsService.updateStats(creator._id.toString(), 'totalStores', 1);
        return savedStore;
    }
    async findById(storeId) {
        const store = await this.storeModel
            .findById(storeId)
            .populate({
            path: 'creatorId',
            select: 'businessName slug logo isVerified',
        })
            .populate('userId', 'firstName lastName avatar')
            .exec();
        if (!store) {
            throw new common_1.NotFoundException('Store not found');
        }
        return store;
    }
    async findBySlug(slug) {
        const store = await this.storeModel
            .findOne({ slug, status: contants_1.StoreStatus.Active })
            .populate({
            path: 'creatorId',
            select: 'businessName slug logo isVerified whatsappNumber',
        })
            .populate('userId', 'firstName lastName avatar')
            .exec();
        if (!store) {
            throw new common_1.NotFoundException('Store not found');
        }
        return store;
    }
    async findMyStores(userId) {
        return this.storeModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByCreatorId(creatorId) {
        return this.storeModel
            .find({
            creatorId: new mongoose_2.Types.ObjectId(creatorId),
            status: contants_1.StoreStatus.Active,
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(storeId, userId, updateStoreDto) {
        const store = await this.verifyOwnership(storeId, userId);
        if (updateStoreDto.bio !== undefined) {
            updateStoreDto.description = updateStoreDto.bio;
            delete updateStoreDto.bio;
        }
        if (updateStoreDto.operatingHours) {
            const { _id, id, ...cleanHours } = updateStoreDto.operatingHours;
            updateStoreDto.operatingHours = cleanHours;
        }
        if (updateStoreDto.bankDetails) {
            const { _id, id, ...cleanBank } = updateStoreDto.bankDetails;
            updateStoreDto.bankDetails = cleanBank;
        }
        if (updateStoreDto.socialLinks) {
            const { _id, id, ...cleanSocial } = updateStoreDto.socialLinks;
            updateStoreDto.socialLinks = cleanSocial;
        }
        if (updateStoreDto.notifications) {
            const { _id, id, ...cleanNotifs } = updateStoreDto.notifications;
            updateStoreDto.notifications = cleanNotifs;
        }
        if (updateStoreDto.name && updateStoreDto.name !== store.name) {
            updateStoreDto.slug = await this.generateUniqueSlug(updateStoreDto.name);
        }
        Object.assign(store, updateStoreDto);
        return store.save();
    }
    async toggleVisibility(storeId, userId) {
        const store = await this.verifyOwnership(storeId, userId);
        store.isVisible = !store.isVisible;
        await store.save();
        return { isVisible: store.isVisible };
    }
    async closeStore(storeId, userId) {
        const store = await this.verifyOwnership(storeId, userId);
        store.status = contants_1.StoreStatus.Closed;
        const closedStore = await store.save();
        await this.creatorsService.updateStats(store.creatorId.toString(), 'totalStores', -1);
        return closedStore;
    }
    async findAll(queryDto) {
        const { page, perPage, sort, search, status, category, state, city, creatorId, } = queryDto;
        const filter = {};
        filter.status = status || contants_1.StoreStatus.Active;
        filter.isVisible = true;
        if (category)
            filter.categories = category;
        if (state)
            filter['location.state'] = { $regex: state, $options: 'i' };
        if (city)
            filter['location.city'] = { $regex: city, $options: 'i' };
        if (creatorId)
            filter.creatorId = new mongoose_2.Types.ObjectId(creatorId);
        if (search) {
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
        const sortObj = {};
        if (sort) {
            const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            sortObj[sortField] = sortOrder;
        }
        else {
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
    async updateStats(storeId, field, amount) {
        await this.storeModel
            .findByIdAndUpdate(storeId, { $inc: { [field]: amount } })
            .exec();
    }
    async countStores(filter = {}) {
        return this.storeModel.countDocuments(filter).exec();
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(store_schema_1.Store.name)),
    __param(1, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        creators_service_1.CreatorsService])
], StoresService);
//# sourceMappingURL=stores.service.js.map