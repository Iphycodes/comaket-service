/**
 * admin/admin.module.ts - Admin Module
 * =======================================
 * The admin module imports ALL other modules because it needs
 * access to their services for dashboard stats and management.
 *
 * We also import the User and Creator Mongoose models directly
 * because AdminService does some queries that the respective
 * services don't expose (like listing users with pagination).
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { Listing, ListingSchema } from '../listings/schemas/listing.schema';
import { UsersModule } from '../users/users.module';
import { CreatorsModule } from '../creators/creators.module';
import { StoresModule } from '../stores/stores.module';
import { ListingsModule } from '../listings/listings.module';
import { OrdersModule } from '../orders/orders.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Listing.name, schema: ListingSchema },
    ]),
    UsersModule,
    CreatorsModule,
    StoresModule,
    ListingsModule,
    OrdersModule,
    PlatformSettingsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}