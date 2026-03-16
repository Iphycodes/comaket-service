/**
 * disputes/schemas/dispute.schema.ts - Dispute Database Model
 * ==============================================================
 * A Dispute is created when a user has an issue with an order,
 * payment, product quality, delivery, or a seller. Disputes can
 * also be general (no order attached).
 *
 * DISPUTE FLOW:
 *
 *   User opens a dispute
 *     |
 *   Dispute created with status: OPEN
 *     |
 *   Admin reviews and assigns:
 *     -> UNDER_REVIEW: Admin is investigating
 *     -> RESOLVED: Issue addressed, resolution provided
 *     -> CLOSED: Dispute closed (no further action)
 *
 * MESSAGES:
 *   Both the user and admin can add messages to a dispute thread,
 *   creating a back-and-forth conversation about the issue.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '@common/schemas/base-schema';

export type DisputeDocument = Dispute & Document;

// ─── Enums ──────────────────────────────────────────────────

export enum DisputeType {
  OrderIssue = 'order_issue',
  PaymentIssue = 'payment_issue',
  ProductQuality = 'product_quality',
  DeliveryIssue = 'delivery_issue',
  SellerDispute = 'seller_dispute',
  Other = 'other',
}

export enum DisputeStatus {
  Open = 'open',
  UnderReview = 'under_review',
  Resolved = 'resolved',
  Closed = 'closed',
}

export enum DisputePriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// ─── Embedded sub-documents ─────────────────────────────────

class DisputeMessage {
  sender: Types.ObjectId;
  message: string;
  createdAt: Date;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Dispute extends BaseSchema {
  // ─── Parties ─────────────────────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // ─── Related Order (optional) ────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId: Types.ObjectId | null;

  // ─── Dispute Details ─────────────────────────────────────

  @Prop({
    type: String,
    enum: Object.values(DisputeType),
    required: true,
  })
  type: DisputeType;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  description: string;

  // ─── Status & Priority ───────────────────────────────────

  @Prop({
    type: String,
    enum: Object.values(DisputeStatus),
    default: DisputeStatus.Open,
  })
  status: DisputeStatus;

  @Prop({
    type: String,
    enum: Object.values(DisputePriority),
    default: DisputePriority.Medium,
  })
  priority: DisputePriority;

  // ─── Resolution ──────────────────────────────────────────

  @Prop({ type: String, default: null })
  resolution: string | null;

  // ─── Attachments ─────────────────────────────────────────

  @Prop({ type: [String], default: [] })
  attachments: string[];

  // ─── Messages Thread ─────────────────────────────────────

  @Prop({
    type: [
      {
        sender: { type: Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  messages: DisputeMessage[];

  // ─── Admin Assignment ────────────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId | null;

  // ─── Timestamps ──────────────────────────────────────────

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);

// ─── Indexes ─────────────────────────────────────────────────

DisputeSchema.index({ userId: 1, status: 1 }); // User's disputes
DisputeSchema.index({ orderId: 1 }); // Disputes by order
DisputeSchema.index({ status: 1, createdAt: -1 }); // Admin: filter by status
DisputeSchema.index({ priority: 1, status: 1 }); // Admin: filter by priority
DisputeSchema.index({ assignedTo: 1, status: 1 }); // Admin: assigned disputes
DisputeSchema.index({ type: 1, status: 1 }); // Admin: filter by type
