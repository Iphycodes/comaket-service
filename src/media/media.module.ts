/**
 * media/media.module.ts - Media Module
 * =======================================
 * Imports ALL entity schemas because MediaService needs to update
 * image fields on ANY entity (user, creator, store, listing, category).
 *
 * DEPENDENCIES:
 *   - Cloudinary (npm package: cloudinary)
 *   - Multer (built into @nestjs/platform-express)
 *
 * Install Cloudinary:
 *   npm install cloudinary
 *   npm install -D @types/multer
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';
import { Listing, ListingSchema } from '../listings/schemas/listing.schema';
import { Category, CategorySchema } from 'src/categories/schema/categories.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Listing.name, schema: ListingSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}