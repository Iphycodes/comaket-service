/**
 * users/users.module.ts - Users Module
 * =======================================
 * This module bundles everything related to users:
 * - The User Mongoose schema (database model)
 * - The UsersService (business logic)
 * - The UsersController (HTTP endpoints)
 *
 * MongooseModule.forFeature() registers the User schema with THIS module.
 * Think of it like saying: "This module needs access to the User collection."
 *
 * exports: [UsersService] makes UsersService available to OTHER modules
 * that import UsersModule. The AuthModule needs this to look up users
 * during login/registration.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // AuthModule will need this
})
export class UsersModule {}
