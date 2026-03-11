/**
 * notifications/notifications.module.ts - Notifications Module
 * ==============================================================
 * This is a GLOBAL module — any service in the app can inject
 * NotificationsService without importing NotificationsModule.
 *
 * We make it global because emails are sent from many places:
 *   AuthService, OrdersService, ListingsService, etc.
 *
 * INSTALL:
 *   npm install nodemailer
 *   npm install -D @types/nodemailer
 */

import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Global() // Makes NotificationsService available everywhere without importing this module
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}