/**
 * categories/categories.service.ts - Category Business Logic
 * =============================================================
 * Simple CRUD with hierarchy support. Categories are admin-managed.
 *
 * Key features:
 * - Auto slug generation from name
 * - Parent/child hierarchy (one level deep for simplicity)
 * - getTree() returns nested structure for frontend menus
 * - listingCount tracking for category pages
 */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schema/categories.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // ─── Create (Admin) ─────────────────────────────────────

  async create(createDto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = this.generateSlug(createDto.name);

    const existing = await this.categoryModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException(
        `Category "${createDto.name}" already exists`,
      );
    }

    // Validate parent exists if provided
    if (createDto.parentId) {
      const parent = await this.categoryModel
        .findById(createDto.parentId)
        .exec();
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = new this.categoryModel({
      ...createDto,
      slug,
      parentId: createDto.parentId
        ? new Types.ObjectId(createDto.parentId)
        : null,
    });

    return category.save();
  }

  // ─── Update (Admin) ─────────────────────────────────────

  async update(
    categoryId: string,
    updateDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    // Regenerate slug if name changed
    if (updateDto.name) {
      (updateDto as any).slug = this.generateSlug(updateDto.name);
    }

    if (updateDto.parentId) {
      (updateDto as any).parentId = new Types.ObjectId(updateDto.parentId);
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(categoryId, { $set: updateDto }, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ─── Delete (Admin) ─────────────────────────────────────

  async remove(categoryId: string): Promise<{ message: string }> {
    // Check for child categories
    const children = await this.categoryModel
      .countDocuments({ parentId: new Types.ObjectId(categoryId) })
      .exec();

    if (children > 0) {
      throw new ConflictException(
        'Cannot delete a category that has sub-categories. Delete the sub-categories first.',
      );
    }

    const result = await this.categoryModel
      .findByIdAndDelete(categoryId)
      .exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }

  // ─── Get All (Flat list) ────────────────────────────────

  async findAll(activeOnly = true): Promise<CategoryDocument[]> {
    const filter: Record<string, any> = {};
    if (activeOnly) filter.isActive = true;

    return this.categoryModel
      .find(filter)
      .populate('parentId', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  // ─── Get Category Tree (Nested) ─────────────────────────

  /**
   * Returns categories in a nested tree structure:
   * [
   *   { name: 'Fashion', children: [
   *     { name: "Men's Wear", children: [] },
   *     { name: "Women's Wear", children: [] },
   *   ]},
   *   { name: 'Electronics', children: [...] }
   * ]
   *
   * This is what the frontend needs for navigation menus and
   * category filter dropdowns.
   */
  async getTree(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean() // Returns plain objects instead of Mongoose documents (faster)
      .exec();

    // Build tree from flat list
    const map = new Map<string, any>();
    const roots: any[] = [];

    // First pass: create map of all categories
    for (const cat of categories) {
      map.set(cat._id.toString(), { ...cat, children: [] });
    }

    // Second pass: link children to parents
    for (const cat of categories) {
      const node = map.get(cat._id.toString());
      if (cat.parentId) {
        const parent = map.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  // ─── Get by Slug ────────────────────────────────────────

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .populate('parentId', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ─── Get Sub-categories ─────────────────────────────────

  async findChildren(parentId: string): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({
        parentId: new Types.ObjectId(parentId),
        isActive: true,
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  // ─── Stats ──────────────────────────────────────────────

  async updateListingCount(
    categorySlug: string,
    amount: number,
  ): Promise<void> {
    await this.categoryModel
      .findOneAndUpdate(
        { slug: categorySlug },
        { $inc: { listingCount: amount } },
      )
      .exec();
  }
}