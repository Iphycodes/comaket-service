import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedProductsController } from './saved-products.controller';
import { SavedProductsService } from './saved-products.service';
import { Listing, ListingSchema } from '../listings/schemas/listing.schema';
import {
  SavedProduct,
  SavedProductSchema,
} from './schema/saved-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedProduct.name, schema: SavedProductSchema },
      { name: Listing.name, schema: ListingSchema },
    ]),
  ],
  controllers: [SavedProductsController],
  providers: [SavedProductsService],
  exports: [SavedProductsService],
})
export class SavedProductsModule {}
