/**
 * listings/listings.module.ts - Listings Module
 * ================================================
 * The core module of Comaket — product listings.
 *
 * DEPENDENCY CHAIN:
 *   ListingsModule → imports StoresModule (verify store ownership, update stats)
 *                  → imports CreatorsModule (get creatorId, update stats)
 *
 * EXPORTS:
 *   ListingsService for:
 *   - OrdersModule (lookup listing when creating an order)
 *   - AdminModule (admin dashboard stats)
 *   - PaymentsModule (verify listing before processing payment)
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { StoresModule } from '../stores/stores.module';
import { CreatorsModule } from '../creators/creators.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { Listing, ListingSchema } from './schemas/listing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    StoresModule, // Verify store ownership, update store stats
    CreatorsModule, // Get creator profile, update creator stats
    PlatformSettingsModule, // DB-backed fee/commission settings
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}