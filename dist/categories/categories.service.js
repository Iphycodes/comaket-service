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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const categories_schema_1 = require("./schema/categories.schema");
let CategoriesService = class CategoriesService {
    constructor(categoryModel) {
        this.categoryModel = categoryModel;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    async create(createDto) {
        const slug = this.generateSlug(createDto.name);
        const existing = await this.categoryModel.findOne({ slug }).exec();
        if (existing) {
            throw new common_1.ConflictException(`Category "${createDto.name}" already exists`);
        }
        if (createDto.parentId) {
            const parent = await this.categoryModel
                .findById(createDto.parentId)
                .exec();
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        const category = new this.categoryModel({
            ...createDto,
            slug,
            parentId: createDto.parentId
                ? new mongoose_2.Types.ObjectId(createDto.parentId)
                : null,
        });
        return category.save();
    }
    async update(categoryId, updateDto) {
        if (updateDto.name) {
            updateDto.slug = this.generateSlug(updateDto.name);
        }
        if (updateDto.parentId) {
            updateDto.parentId = new mongoose_2.Types.ObjectId(updateDto.parentId);
        }
        const category = await this.categoryModel
            .findByIdAndUpdate(categoryId, { $set: updateDto }, { new: true })
            .exec();
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async remove(categoryId) {
        const children = await this.categoryModel
            .countDocuments({ parentId: new mongoose_2.Types.ObjectId(categoryId) })
            .exec();
        if (children > 0) {
            throw new common_1.ConflictException('Cannot delete a category that has sub-categories. Delete the sub-categories first.');
        }
        const result = await this.categoryModel
            .findByIdAndDelete(categoryId)
            .exec();
        if (!result) {
            throw new common_1.NotFoundException('Category not found');
        }
        return { message: 'Category deleted successfully' };
    }
    async findAll(activeOnly = true) {
        const filter = {};
        if (activeOnly)
            filter.isActive = true;
        return this.categoryModel
            .find(filter)
            .populate('parentId', 'name slug')
            .sort({ sortOrder: 1, name: 1 })
            .exec();
    }
    async getTree() {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .lean()
            .exec();
        const map = new Map();
        const roots = [];
        for (const cat of categories) {
            map.set(cat._id.toString(), { ...cat, children: [] });
        }
        for (const cat of categories) {
            const node = map.get(cat._id.toString());
            if (cat.parentId) {
                const parent = map.get(cat.parentId.toString());
                if (parent) {
                    parent.children.push(node);
                }
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    async findBySlug(slug) {
        const category = await this.categoryModel
            .findOne({ slug, isActive: true })
            .populate('parentId', 'name slug')
            .exec();
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async findChildren(parentId) {
        return this.categoryModel
            .find({
            parentId: new mongoose_2.Types.ObjectId(parentId),
            isActive: true,
        })
            .sort({ sortOrder: 1, name: 1 })
            .exec();
    }
    async updateListingCount(categorySlug, amount) {
        await this.categoryModel
            .findOneAndUpdate({ slug: categorySlug }, { $inc: { listingCount: amount } })
            .exec();
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(categories_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map