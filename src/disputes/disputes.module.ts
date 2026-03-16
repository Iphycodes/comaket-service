/**
 * disputes/disputes.module.ts - Disputes Module
 * ================================================
 * Handles dispute creation, management, and resolution.
 *
 * Users can open disputes for order issues, payment problems,
 * product quality concerns, delivery issues, or seller disputes.
 * Admins can review, assign, and resolve disputes.
 *
 * EXPORTS:
 *   DisputesService for:
 *   - AdminModule (dashboard stats, dispute management)
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { Dispute, DisputeSchema } from './schemas/dispute.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dispute.name, schema: DisputeSchema }]),
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
