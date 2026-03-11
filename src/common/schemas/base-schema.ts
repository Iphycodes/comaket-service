/**
 * common/schemas/base.schema.ts - Base Model Fields
 * ====================================================
 * Every document (record) in our database will share certain fields:
 * - createdAt / updatedAt: auto-managed by Mongoose timestamps
 * - isDeleted / deletedAt: for "soft deletes" (mark as deleted instead of
 *   actually removing from the database — safer for data recovery)
 *
 * IMPROVEMENT over Redymit: Your BaseModel extended Schema (the Mongoose class),
 * which is incorrect — it should just be a regular class with @Prop() decorators.
 * Also removed publicId since MongoDB's _id already serves as a unique identifier,
 * and Mongoose generates a virtual 'id' getter automatically.
 *
 * How to use:
 *   @Schema({ timestamps: true })
 *   export class User extends BaseSchema {
 *     @Prop()
 *     name: string;
 *   }
 *
 * The 'extends BaseSchema' gives User the isDeleted and deletedAt fields
 * automatically without repeating them.
 */

import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  @Prop({ type: Boolean, default: false, select: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date;

  // These are added automatically by { timestamps: true } in @Schema()
  createdAt: Date;
  updatedAt: Date;
}