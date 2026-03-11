/**
 * reviews/schemas/review.schema.ts - Review Database Model
 * ===========================================================
 * Flexible review system — users can review:
 *   - A creator (creatorId)
 *   - A store (storeId)
 *   - A listing (listingId)
 *   - An order (orderId)
 *
 * All target fields are optional. At least one must be provided.
 * If the reviewer is not logged in, reviewerId is null (anonymous).
 */

import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review extends BaseSchema {
  // ─── Reviewer ──────────────────────────────────────────────
  // Null = anonymous review

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reviewerId: Types.ObjectId | null;

  @Prop({ type: String, default: 'Anonymous' })
  reviewerName: string;

  // ─── Review Targets (all optional, at least one required) ──

  @Prop({ type: Types.ObjectId, ref: 'Creator', default: null })
  creatorId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Store', default: null })
  storeId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Listing', default: null })
  listingId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId: Types.ObjectId | null;

  // ─── Review Content ────────────────────────────────────────

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, default: null })
  comment?: string;

  // ─── Admin moderation ──────────────────────────────────────

  @Prop({ default: true })
  isVisible: boolean;

  @Prop({ type: String, default: null })
  sellerReply?: string;

  @Prop({ type: Date, default: null })
  sellerReplyAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ creatorId: 1, isVisible: 1 });
ReviewSchema.index({ storeId: 1, isVisible: 1 });
ReviewSchema.index({ listingId: 1, isVisible: 1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ reviewerId: 1 });