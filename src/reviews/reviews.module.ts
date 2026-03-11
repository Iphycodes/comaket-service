/**
 * reviews/reviews.module.ts - Reviews Module
 * =============================================
 * We import MongooseModule for BOTH Review and Order schemas.
 * The Order schema import is needed because ReviewsService queries
 * orders directly to verify purchase (proof of purchase check).
 *
 * An alternative would be to import OrdersModule and use OrdersService,
 * but that creates a circular dependency (Orders → Listings → ... → Reviews).
 * Importing just the schema avoids that.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { StoresModule } from '../stores/stores.module';
import { CreatorsModule } from '../creators/creators.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: User.name, schema: UserSchema },
    ]),
    StoresModule,
    CreatorsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}