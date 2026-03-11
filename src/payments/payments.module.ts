/**
 * payments/payments.module.ts - Payments Module
 * ================================================
 * Integrates Paystack for all payment operations.
 *
 * DEPENDENCY:
 *   PaymentsModule → OrdersModule (confirm payments, lookup orders)
 *
 * NOTE: We don't create a separate Mongoose schema for payments.
 * Payment info is embedded directly in the Order document
 * (order.paymentInfo). This is intentional:
 *
 * - Payments and orders are 1-to-1 (one payment per order)
 * - Having a separate payments collection would mean maintaining
 *   two sources of truth for payment status
 * - Embedding keeps queries simple (one lookup to get order + payment)
 *
 * If you later need to track listing fees and subscription payments
 * separately, you can create a Transaction schema at that point.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';
import { CartModule } from '../cart/cart.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { Listing, ListingSchema } from '../listings/schemas/listing.schema';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';

@Module({
  imports: [
    OrdersModule,
    forwardRef(() => CartModule),
    PlatformSettingsModule,
    MongooseModule.forFeature([
      { name: Listing.name, schema: ListingSchema },
      { name: Creator.name, schema: CreatorSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}