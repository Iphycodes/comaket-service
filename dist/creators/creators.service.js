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
exports.CreatorsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const creator_schema_1 = require("./schemas/creator.schema");
const users_service_1 = require("../users/users.service");
const contants_1 = require("../config/contants");
let CreatorsService = class CreatorsService {
    constructor(creatorModel, usersService) {
        this.creatorModel = creatorModel;
        this.usersService = usersService;
    }
    async generateUniqueSlug(username) {
        let slug = username
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9_-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        const existing = await this.creatorModel.findOne({ slug }).exec();
        if (existing) {
            const suffix = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${suffix}`;
        }
        return slug;
    }
    resolvePlan(planId) {
        if (!planId)
            return contants_1.CreatorPlan.Starter;
        const planMap = {
            starter: contants_1.CreatorPlan.Starter,
            pro: contants_1.CreatorPlan.Pro,
            business: contants_1.CreatorPlan.Business,
        };
        return planMap[planId.toLowerCase()] || contants_1.CreatorPlan.Starter;
    }
    async becomeCreator(userId, becomeCreatorDto) {
        const existingCreator = await this.creatorModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (existingCreator) {
            throw new common_1.ConflictException('You already have a creator profile');
        }
        const existingUsername = await this.creatorModel
            .findOne({ username: becomeCreatorDto.username })
            .exec();
        if (existingUsername) {
            throw new common_1.ConflictException(`Username "${becomeCreatorDto.username}" is already taken`);
        }
        const slug = await this.generateUniqueSlug(becomeCreatorDto.username);
        const { firstName, lastName, planId, ...creatorFields } = becomeCreatorDto;
        const creator = new this.creatorModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            ...creatorFields,
            slug,
            plan: this.resolvePlan(planId),
            status: contants_1.CreatorStatus.Active,
        });
        const savedCreator = await creator.save();
        const userUpdate = { role: contants_1.UserRole.Creator };
        if (firstName)
            userUpdate.firstName = firstName;
        if (lastName)
            userUpdate.lastName = lastName;
        await this.usersService.updateInternal(userId, userUpdate);
        return savedCreator;
    }
    async checkUsername(username) {
        const existing = await this.creatorModel
            .findOne({ username: username.trim() })
            .select('_id')
            .lean()
            .exec();
        return { available: !existing };
    }
    async findById(creatorId) {
        const creator = await this.creatorModel
            .findById(creatorId)
            .populate('userId', 'firstName lastName email avatar')
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        return creator;
    }
    async findByUserId(userId) {
        const creator = await this.creatorModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .populate('userId', 'firstName lastName email avatar')
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        return creator;
    }
    async findBySlug(slug) {
        const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const creator = await this.creatorModel
            .findOne({
            $or: [
                { slug: slug.toLowerCase(), status: contants_1.CreatorStatus.Active },
                {
                    username: { $regex: new RegExp(`^${escaped}$`, 'i') },
                    status: contants_1.CreatorStatus.Active,
                },
            ],
        })
            .populate('userId', 'firstName lastName email avatar')
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        return creator;
    }
    async updateProfile(userId, updateCreatorDto) {
        const creator = await this.creatorModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        if (updateCreatorDto.username &&
            updateCreatorDto.username !== creator.username) {
            const existingUsername = await this.creatorModel
                .findOne({
                username: updateCreatorDto.username,
                _id: { $ne: creator._id },
            })
                .exec();
            if (existingUsername) {
                throw new common_1.ConflictException(`Username "${updateCreatorDto.username}" is already taken`);
            }
            const newSlug = await this.generateUniqueSlug(updateCreatorDto.username);
            updateCreatorDto.slug = newSlug;
        }
        if (updateCreatorDto.featuredWorks?.length > 0 &&
            creator.plan === contants_1.CreatorPlan.Starter) {
            throw new common_1.BadRequestException('Featured works are available on Pro and Business plans. Please upgrade your plan.');
        }
        const { firstName, lastName, planId, ...creatorFields } = updateCreatorDto;
        if (firstName || lastName) {
            const userUpdate = {};
            if (firstName)
                userUpdate.firstName = firstName;
            if (lastName)
                userUpdate.lastName = lastName;
            await this.usersService.updateInternal(userId, userUpdate);
        }
        if (planId) {
            creatorFields.plan = this.resolvePlan(planId);
        }
        Object.assign(creator, creatorFields);
        return creator.save();
    }
    async updateBankDetails(userId, bankDetailsDto) {
        const creator = await this.creatorModel
            .findOneAndUpdate({ userId: new mongoose_2.Types.ObjectId(userId) }, { $set: { bankDetails: bankDetailsDto } }, { new: true })
            .exec();
        if (!creator) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        return creator;
    }
    async findAll(queryDto) {
        const { page, perPage, sort, search, status, plan, industry, state, city, isVerified, } = queryDto;
        const filter = {};
        filter.status = status || contants_1.CreatorStatus.Active;
        if (plan)
            filter.plan = plan;
        if (industry)
            filter.industries = industry;
        if (state)
            filter['location.state'] = { $regex: state, $options: 'i' };
        if (city)
            filter['location.city'] = { $regex: city, $options: 'i' };
        if (isVerified !== undefined)
            filter.isVerified = isVerified;
        if (search) {
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
    async updateStats(creatorId, field, amount) {
        await this.creatorModel
            .findByIdAndUpdate(creatorId, { $inc: { [field]: amount } })
            .exec();
    }
    async countCreators(filter = {}) {
        return this.creatorModel.countDocuments(filter).exec();
    }
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map