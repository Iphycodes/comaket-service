/**
 * cart/schemas/cart.schema.ts - Shopping Cart Model
 * ===================================================
 * Each user has one cart document (upserted on first add).
 * Cart items reference listings with a quantity.
 *
 * Design:
 * - One cart per user (userId unique index)
 * - Cart stores item snapshots (name, price, image) so the UI
 *   can render even if the listing changes
 * - Cart is validated at checkout time against live listing data
 * - Cart auto-expires after 7 days of inactivity (TTL index)
 */

import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── Cart Item (embedded subdocument) ──────────────────────────────

@Schema({ _id: true, timestamps: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true })
  listingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  // Snapshot fields (captured at add-to-cart time for fast rendering)
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  unitPrice: number; // In kobo

  @Prop({ default: 'NGN' })
  currency: string;

  @Prop({ type: String, default: null })
  image?: string;

  @Prop({ required: true })
  type: string; // 'consignment' | 'direct_purchase'

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sellerId: Types.ObjectId;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

// ─── Cart (main document) ──────────────────────────────────────────

export type CartDocument = Cart & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Cart extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// One cart per user
CartSchema.index({ userId: 1 }, { unique: true });
// Auto-expire idle carts after 7 days
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
