/**
 * featured-works/schemas/featured-work.schema.ts
 * =================================================
 * A FeaturedWork is a portfolio/showcase item on a Creator or Store profile.
 * Each item has an image URL, optional title/description, and a position
 * for ordering on the profile page.
 *
 * Polymorphic design: ownerType ('creator' | 'store') + ownerId
 * so one collection handles both.
 *
 * Plan limits:
 *   Starter: 0 (not available)
 *   Pro: 10
 *   Business: 25
 */

import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeaturedWorkDocument = FeaturedWork & Document;

export enum FeaturedWorkOwnerType {
  Creator = 'creator',
  Store = 'store',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class FeaturedWork extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Owner's user ID for fast auth checks

  @Prop({
    type: String,
    enum: Object.values(FeaturedWorkOwnerType),
    required: true,
  })
  ownerType: FeaturedWorkOwnerType;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId: Types.ObjectId; // Creator or Store _id

  @Prop({ type: [String], required: true })
  images: string[]; // Array of Cloudinary URLs

  @Prop({ type: String, default: null })
  title?: string; // Optional caption

  @Prop({ type: String, default: null })
  description?: string; // Optional longer description

  @Prop({ type: Number, default: 0 })
  position: number; // Display order (0 = first)
}

export const FeaturedWorkSchema = SchemaFactory.createForClass(FeaturedWork);

// All featured works for a given owner, sorted by position
FeaturedWorkSchema.index({ ownerType: 1, ownerId: 1, position: 1 });
// Fast ownership check
FeaturedWorkSchema.index({ userId: 1 });
