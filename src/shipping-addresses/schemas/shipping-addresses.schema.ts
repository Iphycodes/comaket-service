import { BaseSchema } from '@common/schemas/base-schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShippingAddressDocument = ShippingAddress & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ShippingAddress extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, default: 'Nigeria' })
  country: string;

  @Prop({ type: String })
  zipCode: string;

  @Prop({ type: String })
  label: string; // e.g. "Home", "Office", "Mom's house"

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;
}

export const ShippingAddressSchema =
  SchemaFactory.createForClass(ShippingAddress);

ShippingAddressSchema.index({ userId: 1 });
ShippingAddressSchema.index({ userId: 1, isDefault: 1 });