import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AlertType } from '../../config/contants';
import { BaseSchema } from '../../common/schemas/base-schema';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true })
export class Alert extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AlertType, required: true })
  type: AlertType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false, index: true })
  isRead: boolean;

  // Optional reference to the related entity (order, listing, store, etc.)
  @Prop({ type: Types.ObjectId, default: null })
  entityId?: Types.ObjectId;

  // The entity type so frontend knows where to navigate
  @Prop({ type: String, default: null })
  entityType?: 'order' | 'listing' | 'store' | 'dispute' | 'review' | 'user';

  // Optional metadata for extra context
  @Prop({ type: Object, default: null })
  metadata?: Record<string, any>;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

// Compound index for efficient queries
AlertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
AlertSchema.index({ userId: 1, createdAt: -1 });
