/**
 * platform-settings/platform-settings.service.ts
 * =================================================
 * Manages the singleton PlatformSettings document.
 *
 * Key design decisions:
 * - Settings are a singleton (key: 'platform'). getSettings() uses upsert
 *   to create the document on first access with defaults.
 * - All fee/commission helpers read from DB first, fall back to env config.
 * - The ListingsService will inject this service instead of reading
 *   directly from ConfigService for fee values.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  PlatformSettings,
  PlatformSettingsDocument,
} from './schemas/platform-settings.schema';

@Injectable()
export class PlatformSettingsService {
  constructor(
    @InjectModel(PlatformSettings.name)
    private settingsModel: Model<PlatformSettingsDocument>,
    private configService: ConfigService,
  ) {}

  /**
   * Get the platform settings (creates with defaults if doesn't exist).
   */
  async getSettings(): Promise<PlatformSettingsDocument> {
    const settings = await this.settingsModel
      .findOneAndUpdate(
        { key: 'platform' },
        { $setOnInsert: { key: 'platform' } },
        { upsert: true, new: true },
      )
      .exec();
    return settings;
  }

  /**
   * Update platform settings. Only the provided fields are updated.
   */
  async updateSettings(
    updates: Partial<PlatformSettings>,
  ): Promise<PlatformSettingsDocument> {
    // Remove key field to prevent changing the singleton key
    const { key, ...safeUpdates } = updates as any;

    const settings = await this.settingsModel
      .findOneAndUpdate(
        { key: 'platform' },
        { $set: safeUpdates },
        { upsert: true, new: true, runValidators: true },
      )
      .exec();
    return settings;
  }

  // ─── Convenience Getters (used by ListingsService) ─────────────

  async isFreeListing(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.freeListing;
  }

  async isNoCommission(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.noCommission;
  }

  async getSelfListingFeePercent(): Promise<number> {
    const settings = await this.getSettings();
    return settings.selfListingFeePercent;
  }

  async getListingFeeCapKobo(): Promise<number> {
    const settings = await this.getSettings();
    return settings.listingFeeCapKobo;
  }

  async getConsignmentCommissionPercent(): Promise<number> {
    const settings = await this.getSettings();
    return settings.consignmentCommissionPercent;
  }

  // ─── Plan Pricing (used by PaymentsService) ──────────────────

  /**
   * Returns a map of plan → price in kobo, reading from DB.
   */
  async getPlanPricing(): Promise<Record<string, number>> {
    const settings = await this.getSettings();
    return {
      starter: settings.starterPlanPriceKobo,
      pro: settings.proPlanPriceKobo,
      business: settings.businessPlanPriceKobo,
    };
  }

  /**
   * Returns which plans are currently active (visible to users).
   */
  async getActivePlans(): Promise<Record<string, boolean>> {
    const settings = await this.getSettings();
    return {
      starter: settings.starterPlanActive,
      pro: settings.proPlanActive,
      business: settings.businessPlanActive,
    };
  }

  /**
   * Returns public-facing settings (no auth required).
   * Used by frontend to display plan pricing, feature flags, etc.
   */
  async getPublicSettings(): Promise<{
    plans: Array<{ id: string; priceKobo: number; active: boolean }>;
    featureFlags: {
      selfListingEnabled: boolean;
      consignmentEnabled: boolean;
      directSaleEnabled: boolean;
      maintenanceMode: boolean;
    };
  }> {
    const settings = await this.getSettings();
    return {
      plans: [
        { id: 'starter', priceKobo: settings.starterPlanPriceKobo, active: settings.starterPlanActive },
        { id: 'pro', priceKobo: settings.proPlanPriceKobo, active: settings.proPlanActive },
        { id: 'business', priceKobo: settings.businessPlanPriceKobo, active: settings.businessPlanActive },
      ],
      featureFlags: {
        selfListingEnabled: settings.selfListingEnabled,
        consignmentEnabled: settings.consignmentEnabled,
        directSaleEnabled: settings.directSaleEnabled,
        maintenanceMode: settings.maintenanceMode,
      },
    };
  }
}
