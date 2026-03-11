import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingAddressesController } from './shipping-addresses.controller';
import { ShippingAddressesService } from './shipping-addresses.service';
import { ShippingAddress, ShippingAddressSchema } from './schemas/shipping-addresses.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingAddress.name, schema: ShippingAddressSchema },
    ]),
  ],
  controllers: [ShippingAddressesController],
  providers: [ShippingAddressesService],
  exports: [ShippingAddressesService],
})
export class ShippingAddressesModule {}