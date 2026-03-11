/**
 * saved-products/schemas/saved-product.schema.ts - Wishlist Model
 * ================================================================
 * Users can save/bookmark listings they're interested in.
 * Simple join table: userId + listingId.
 *
 * - One save per user per listing (unique index)
 * - Saving a listing doesn't affect the listing itself
 * - Saved products are private to the user
 */

import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedProductDocument = SavedProduct & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class SavedProduct extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true })
  listingId: Types.ObjectId;
}

export const SavedProductSchema = SchemaFactory.createForClass(SavedProduct);

// One save per user per listing
SavedProductSchema.index({ userId: 1, listingId: 1 }, { unique: true });
// Fast lookup: "get all my saved products"
SavedProductSchema.index({ userId: 1, createdAt: -1 });