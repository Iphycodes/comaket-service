import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './schema/cart.schema';
import {
  CheckoutSession,
  CheckoutSessionSchema,
} from './schema/checkout-session.schema';
import { Listing, ListingSchema } from '../listings/schemas/listing.schema';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: CheckoutSession.name, schema: CheckoutSessionSchema },
      { name: Listing.name, schema: ListingSchema },
    ]),
    OrdersModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
