/**
 * stores/schemas/store.schema.ts - Store Database Model
 * ========================================================
 * A Store belongs to a Creator. One Creator can have MULTIPLE Stores.
 * Think of it like: a fashion designer (Creator) might have a clothing
 * store and an accessories store — same creator, different storefronts.
 *
 * The relationship chain:
 *   User (1) → Creator (1) → Store (many) → Listing (many)
 *
 * When you visit a store page on the frontend, you see:
 *   - Store info (name, logo, description)
 *   - All listings belonging to that store
 *
 * When you visit a creator page, you see:
 *   - Creator info (businessName, portfolio)
 *   - ALL listings from ALL their stores (aggregated)
 *   - Links to individual stores
 *
 * OPERATING HOURS:
 * Since sellers contact buyers via WhatsApp, operating hours help
 * buyers know when to expect a response.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StoreStatus } from '@config/contants';
import { BaseSchema } from '@common/schemas/base-schema';

export type StoreDocument = Store & Document;

// ─── Embedded sub-documents ─────────────────────────────────

class OperatingHours {
  monday?: string; // e.g., "9:00 AM - 6:00 PM" or "Closed"
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

class StoreLocation {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Store extends BaseSchema {
  // ─── Ownership ───────────────────────────────────────────
  // Every store belongs to exactly ONE creator.
  // We store BOTH creatorId and userId for convenience:
  //   - creatorId: to find "all stores by this creator"
  //   - userId: to quickly check ownership without joining to Creator

  @Prop({ type: Types.ObjectId, ref: 'Creator', required: true })
  creatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // ─── Store Identity ──────────────────────────────────────

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string; // URL: comaket.com/stores/johns-clothing

  @Prop({ type: String, default: null })
  logo?: string;

  @Prop({ type: String, default: null })
  coverImage?: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, default: null })
  tagline?: string;

  // ─── Website & Social ─────────────────────────────────────

  @Prop({ type: String, default: null })
  website?: string;

  @Prop({
    type: {
      instagram: String,
      twitter: String,
      facebook: String,
      tiktok: String,
      youtube: String,
    },
    default: {},
  })
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };

  // ─── Contact ─────────────────────────────────────────────

  @Prop({ type: String, default: null })
  phoneNumber?: string;

  @Prop({ type: String, default: null })
  whatsappNumber?: string;

  @Prop({ type: String, default: null })
  email?: string;

  // ─── Location ────────────────────────────────────────────

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    default: {},
  })
  location: StoreLocation;

  // ─── Category & Tags ─────────────────────────────────────

  @Prop({ type: [String], default: [] })
  categories: string[]; // e.g., ["fashion", "accessories"]

  @Prop({ type: [String], default: [] })
  tags: string[]; // Additional tags for discovery

  // ─── Featured Works ───────────────────────────────────────
  // Showcase images for the store profile page.

  @Prop({ type: [String], default: [] })
  featuredWorks: string[];

  // ─── Bank Details (for store-level payouts) ───────────────

  @Prop({
    type: {
      bankName: String,
      bankCode: String,
      accountNumber: String,
      accountName: String,
    },
    default: null,
  })
  bankDetails?: {
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
  };

  // ─── Operating Hours ─────────────────────────────────────

  @Prop({
    type: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
    default: {},
  })
  operatingHours: OperatingHours;

  // ─── Policies ─────────────────────────────────────────────

  @Prop({ type: String, default: null })
  returnPolicy?: string;

  // ─── Notification Preferences ─────────────────────────────

  @Prop({
    type: {
      newOrder: { type: Boolean, default: true },
      newReview: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    default: {
      newOrder: true,
      newReview: true,
      lowStock: true,
      promotions: false,
    },
  })
  notifications?: {
    newOrder?: boolean;
    newReview?: boolean;
    lowStock?: boolean;
    promotions?: boolean;
  };

  // ─── Status ──────────────────────────────────────────────

  @Prop({
    type: String,
    enum: Object.values(StoreStatus),
    default: StoreStatus.Active,
  })
  status: StoreStatus;

  @Prop({ type: Boolean, default: true })
  isVisible: boolean; // Owner can toggle visibility on/off

  // ─── Stats (denormalized) ────────────────────────────────

  @Prop({ type: Number, default: 0 })
  totalListings: number;

  @Prop({ type: Number, default: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0 })
  followers: number;
}

export const StoreSchema = SchemaFactory.createForClass(Store);

// ─── Indexes ─────────────────────────────────────────────────

StoreSchema.index({ creatorId: 1 }); // All stores by a creator
StoreSchema.index({ userId: 1 }); // All stores by a user
StoreSchema.index({ slug: 1 }, { unique: true }); // Fast slug lookups
StoreSchema.index({ status: 1 });
StoreSchema.index({ categories: 1 });
StoreSchema.index({ 'location.state': 1 }); // Filter by state
StoreSchema.index({ 'location.city': 1 }); // Filter by city
StoreSchema.index({ name: 'text', description: 'text' }); // Full-text search