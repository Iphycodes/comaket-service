/**
 * delivery-zones/schemas/delivery-zone.schema.ts
 * ================================================
 * Defines delivery zones with state-level pricing.
 * Admin creates zones (e.g., "Lagos", "South-West") and assigns
 * states + a base delivery fee. The checkout flow looks up the
 * buyer's shipping state to determine the fee.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base-schema';

export type DeliveryZoneDocument = DeliveryZone & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DeliveryZone extends BaseSchema {
  @Prop({ type: String, required: true, trim: true })
  name: string; // e.g., "Lagos", "South-West", "North"

  @Prop({ type: [String], required: true })
  states: string[]; // Nigerian states covered by this zone

  @Prop({ type: Number, required: true })
  baseFee: number; // Base delivery fee in kobo

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, default: '' })
  description: string;
}

export const DeliveryZoneSchema = SchemaFactory.createForClass(DeliveryZone);

// Ensure no duplicate zone names
DeliveryZoneSchema.index({ name: 1 }, { unique: true });
