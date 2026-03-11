/**
 * follows/schemas/follow.schema.ts - Follow Model
 * ==================================================
 * Tracks who follows which creator or store.
 * Uses a polymorphic pattern: targetType ('creator' | 'store') + targetId.
 *
 * - One follow per user per target (unique compound index)
 * - Following increments the target's follower count
 * - Unfollowing decrements it
 */

import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

export enum FollowTargetType {
  Creator = 'creator',
  Store = 'store',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Follow extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // The user who follows

  @Prop({ type: String, enum: Object.values(FollowTargetType), required: true })
  targetType: FollowTargetType; // 'creator' or 'store'

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId; // The creator or store being followed
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// One follow per user per target
FollowSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
// Fast lookup: "get all my follows"
FollowSchema.index({ userId: 1, createdAt: -1 });
// Fast lookup: "get all followers of this target"
FollowSchema.index({ targetType: 1, targetId: 1 });