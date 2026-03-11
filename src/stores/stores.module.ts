/**
 * stores/stores.module.ts - Stores Module
 * ==========================================
 * Bundles everything related to stores.
 *
 * DEPENDENCY CHAIN:
 *   StoresModule → imports CreatorsModule (to check plan limits, update stats)
 *   CreatorsModule → imports UsersModule (to update user role)
 *
 * This is a clean one-way chain. No circular dependencies.
 * Each module only imports what it directly needs.
 *
 * EXPORTS:
 *   StoresService is exported because:
 *   - ListingsModule needs it (every listing belongs to a store)
 *   - AdminModule needs it (admin can manage stores)
 *   - OrdersModule needs it (to update store stats on sale)
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { Store, StoreSchema } from './schemas/store.schema';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { CreatorsModule } from '../creators/creators.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Creator.name, schema: CreatorSchema },
    ]),
    CreatorsModule, // Need CreatorsService for plan checks and stats
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService], // ListingsModule, AdminModule, OrdersModule need this
})
export class StoresModule {}