import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';
import { Follow, FollowSchema } from './schema/follows.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Follow.name, schema: FollowSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: Store.name, schema: StoreSchema },
    ]),
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}