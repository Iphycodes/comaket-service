/**
 * categories/schemas/category.schema.ts - Category Database Model
 * =================================================================
 * Categories organize listings on the marketplace. They support a
 * parent/child hierarchy for nested categories:
 *
 *   Fashion (parent: null)
 *     ├── Men's Wear (parent: Fashion._id)
 *     ├── Women's Wear (parent: Fashion._id)
 *     └── Accessories (parent: Fashion._id)
 *   Electronics (parent: null)
 *     ├── Phones (parent: Electronics._id)
 *     └── Laptops (parent: Electronics._id)
 *
 * parentId = null means it's a top-level (root) category.
 * parentId = someId means it's a sub-category.
 *
 * Categories are managed by admins only. Sellers pick from the
 * existing categories when creating listings.
 */

import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, default: null })
  icon?: string; // Icon name or URL for the frontend

  @Prop({ type: String, default: null })
  image?: string; // Category banner image

  // ─── Hierarchy ───────────────────────────────────────────
  // null = top-level, ObjectId = sub-category

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId?: Types.ObjectId;

  // ─── Display ─────────────────────────────────────────────

  @Prop({ type: Number, default: 0 })
  sortOrder: number; // Controls display order (lower = first)

  @Prop({ default: true })
  isActive: boolean;

  // ─── Stats ───────────────────────────────────────────────

  @Prop({ type: Number, default: 0 })
  listingCount: number; // Denormalized for fast display
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ isActive: 1, sortOrder: 1 });
