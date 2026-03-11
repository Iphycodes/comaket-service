/**
 * creators/schemas/creator.schema.ts - Creator Database Model
 * ==============================================================
 * A Creator is a USER who has upgraded their account to sell on Comaket.
 * This is a SEPARATE collection from Users — not a field on the User document.
 *
 * IMPORTANT: A Creator is a PERSONAL profile, not a business.
 * Think of it like a seller profile — username, bio, industries.
 * The business details (businessName, address, etc.) live on STORES.
 *
 * The relationship:
 *   User (1) ──── has ────→ (0 or 1) Creator
 *   Creator (1) ── has ──→ (0 to many) Stores
 *
 * @Prop({ type: Types.ObjectId, ref: 'User' }) creates a REFERENCE.
 * Think of it like a foreign key in SQL. MongoDB stores just the User's _id,
 * and when you need the full User data, you call .populate('userId').
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '@common/schemas/base-schema';
import { CreatorPlan, CreatorStatus } from '@config/contants';

export type CreatorDocument = Creator & Document;

// ─── Embedded sub-documents (nested objects, not separate collections) ───

class SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

class BankDetails {
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Creator extends BaseSchema {
  // ─── Link to User ────────────────────────────────────────
  // This connects the Creator profile to the User account.
  // ref: 'User' tells Mongoose which collection to look in when you .populate()

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // ─── Creator Profile ─────────────────────────────────────

  @Prop({ required: true, unique: true, trim: true })
  username: string; // Display handle — e.g. "emeka_tech"

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string; // URL-friendly: "emeka-tech" → /creators/emeka-tech

  @Prop({ type: String, default: null })
  bio?: string; // Short bio / about me

  @Prop({ type: String, default: null })
  profileImageUrl?: string; // Profile photo URL

  @Prop({ type: String, default: null })
  coverImage?: string;

  // ─── Contact ──────────────────────────────────────────────

  @Prop({ type: String, default: null })
  contactEmail?: string; // Public contact email (can differ from account email)

  @Prop({ type: String, default: null })
  phoneNumber?: string;

  @Prop({ type: String, default: null })
  whatsappNumber?: string; // For customer contact — core to Comaket's model

  @Prop({ type: String, default: null })
  website?: string; // Personal/portfolio website

  // ─── Social Links ────────────────────────────────────────

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
  socialLinks: SocialLinks;

  // ─── Industries ──────────────────────────────────────────
  // What industries/niches does this creator operate in?

  @Prop({ type: [String], default: [] })
  industries: string[];

  // ─── Tags / Keywords ──────────────────────────────────────
  // Searchable keywords selected by the creator based on their industries.
  // e.g., a "fashion" creator might tag: ["tailor", "ankara", "bespoke"]

  @Prop({ type: [String], default: [] })
  tags: string[];

  // ─── Location ─────────────────────────────────────────────

  @Prop({
    type: {
      country: String,
      state: String,
      city: String,
    },
    default: null,
  })
  location?: { country?: string; state?: string; city?: string };

  // ─── Featured Works ──────────────────────────────────────
  // Highlight portfolio/showcase images on the creator profile page.
  // Available on Pro and Business plans.

  @Prop({ type: [String], default: [] })
  featuredWorks: string[]; // Array of image URLs

  // ─── Subscription ────────────────────────────────────────

  @Prop({
    type: String,
    enum: Object.values(CreatorPlan),
    default: CreatorPlan.Starter,
  })
  plan: CreatorPlan;

  @Prop({ type: String, default: null })
  paystackSubscriptionCode?: string;

  @Prop({ type: String, default: null })
  paystackCustomerCode?: string;

  @Prop({ type: String, default: null })
  paystackEmailToken?: string; // For managing subscription via email

  @Prop({
    type: String,
    enum: ['active', 'cancelled', 'expired', 'none'],
    default: 'none',
  })
  subscriptionStatus: string;

  @Prop({ type: Date, default: null })
  planStartedAt?: Date;

  @Prop({ type: Date, default: null })
  planExpiresAt?: Date;

  @Prop({ type: Number, default: 0 })
  planAmountPaid: number; // In kobo — last amount paid

  @Prop({ type: String, default: null })
  planPaymentReference?: string; // Last Paystack reference

  @Prop({ type: String, default: null })
  planPaymentChannel?: string; // card, bank, ussd, etc.

  // ─── Status & Verification ───────────────────────────────

  @Prop({
    type: String,
    enum: Object.values(CreatorStatus),
    default: CreatorStatus.Active,
  })
  status: CreatorStatus;

  @Prop({ default: false })
  isVerified: boolean; // Verified badge — manually set by admin

  // ─── Bank Details (for payouts) ──────────────────────────

  @Prop({
    type: {
      bankName: String,
      bankCode: String,
      accountNumber: String,
      accountName: String,
    },
    default: null,
  })
  bankDetails?: BankDetails;

  // ─── Stats (denormalized for performance) ────────────────
  // Instead of counting stores/products every time, we keep running totals.
  // These get updated when stores/listings are created/deleted.

  @Prop({ type: Number, default: 0 })
  totalStores: number;

  @Prop({ type: Number, default: 0 })
  totalListings: number;

  @Prop({ type: Number, default: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0 })
  rating: number; // Average rating (0-5)

  @Prop({ type: Number, default: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0 })
  totalFollowers: number;
}

export const CreatorSchema = SchemaFactory.createForClass(Creator);

// ─── Indexes ─────────────────────────────────────────────────
// Indexes make queries fast. Without them, MongoDB scans EVERY document.
// With them, it jumps directly to the matching documents.

CreatorSchema.index({ userId: 1 }, { unique: true }); // One creator per user
CreatorSchema.index({ slug: 1 }, { unique: true }); // Fast slug lookups
CreatorSchema.index({ username: 1 }, { unique: true }); // Unique usernames
CreatorSchema.index({ status: 1 }); // Filter by status
CreatorSchema.index({ plan: 1 }); // Filter by plan
CreatorSchema.index({ industries: 1 }); // Filter by industry
CreatorSchema.index({ tags: 1 }); // Filter by tags/keywords
CreatorSchema.index({ 'location.state': 1 }); // Filter by state
CreatorSchema.index({ 'location.city': 1 }); // Filter by city
CreatorSchema.index({ username: 'text', bio: 'text' }); // Full-text search