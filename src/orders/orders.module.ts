/**
 * orders/orders.module.ts - Orders Module
 * ==========================================
 * Handles the entire purchase flow on Comaket.
 *
 * DEPENDENCY CHAIN:
 *   OrdersModule → ListingsModule (validate listing, check buyability)
 *                → StoresModule (update store sales stats)
 *                → CreatorsModule (update creator sales stats)
 *
 * EXPORTS:
 *   OrdersService for:
 *   - PaymentsModule (confirm payment, lookup by reference)
 *   - AdminModule (dashboard stats, revenue calculations)
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersCronService } from './orders-cron.service';
import { ListingsModule } from '../listings/listings.module';
import { StoresModule } from '../stores/stores.module';
import { CreatorsModule } from '../creators/creators.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ListingsModule, // Validate listings, check buyability
    StoresModule, // Update store sales stats
    CreatorsModule, // Update creator sales stats
    PlatformSettingsModule, // Read maxReturnHoursBeforeAutoComplete for cron
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersCronService],
  exports: [OrdersService],
})
export class OrdersModule {}
