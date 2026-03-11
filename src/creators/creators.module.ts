/**
 * creators/creators.module.ts - Creators Module
 * ================================================
 * Bundles everything related to creators.
 *
 * IMPORTS:
 *   - MongooseModule.forFeature(): Registers the Creator schema so
 *     we can inject the Creator model in CreatorsService.
 *   - UsersModule: CreatorsService needs UsersService to update the
 *     user's role when they become a creator.
 *
 * EXPORTS:
 *   - CreatorsService: Other modules (Stores, Listings, Admin) will need
 *     to interact with creators (e.g., updating stats, looking up creators).
 *
 * Notice the clean dependency chain:
 *   AuthModule → imports UsersModule
 *   CreatorsModule → imports UsersModule
 *   (later) StoresModule → imports CreatorsModule
 *
 * Each module only imports what it directly needs. No circular dependencies.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { UsersModule } from '../users/users.module';
import { Creator, CreatorSchema } from './schemas/creator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Creator.name, schema: CreatorSchema }]),
    UsersModule, // Need UsersService to update user role
  ],
  controllers: [CreatorsController],
  providers: [CreatorsService],
  exports: [CreatorsService], // StoresModule, AdminModule will need this
})
export class CreatorsModule {}
