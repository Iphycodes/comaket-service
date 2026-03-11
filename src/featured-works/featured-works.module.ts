import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeaturedWorksController } from './featured-works.controller';
import { FeaturedWorksService } from './featured-works.service';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';
import {
  FeaturedWork,
  FeaturedWorkSchema,
} from './schema/featured-works.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeaturedWork.name, schema: FeaturedWorkSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: Store.name, schema: StoreSchema },
    ]),
  ],
  controllers: [FeaturedWorksController],
  providers: [FeaturedWorksService],
  exports: [FeaturedWorksService],
})
export class FeaturedWorksModule {}
