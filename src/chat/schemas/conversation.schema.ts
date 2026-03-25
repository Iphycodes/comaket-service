import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  // Per-participant unread counts: { "userId1": 3, "userId2": 0 }
  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts: Map<string, number>;

  // Denormalized last message for fast conversation list queries
  @Prop({
    type: Object,
    default: undefined,
  })
  lastMessage: {
    content: string;
    senderId: Types.ObjectId;
    type: string;
    createdAt: Date;
  } | null;

  // Product context if conversation started from a listing
  @Prop({
    type: Object,
    default: undefined,
  })
  productContext: {
    listingId: Types.ObjectId;
    itemName: string;
    price: number;
    image: string;
  } | null;

  // Display info per participant: { "userId": { displayName, avatar, type } }
  // Denormalized so we don't need to look up creator/store on every chat list render
  @Prop({ type: Map, of: Object, default: {} })
  participantDetails: Map<string, {
    displayName: string;
    avatar?: string;
    type?: 'user' | 'creator' | 'store';
    entityId?: string; // creatorId or storeId for "View Profile" / "View Store" links
    username?: string;
  }>;

  // Differentiates conversations with the same user but as different roles
  // e.g., chatting with a user as "creator" vs as their "store"
  @Prop({ type: String, enum: ['creator', 'store', 'user'], default: 'user' })
  contextType: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes
ConversationSchema.index({ participants: 1, updatedAt: -1 });
ConversationSchema.index({ participants: 1 });
