import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { PlatformSettings, PlatformSettingsDocument } from './schemas/platform-settings.schema';
export declare class PlatformSettingsService {
    private settingsModel;
    private configService;
    constructor(settingsModel: Model<PlatformSettingsDocument>, configService: ConfigService);
    getSettings(): Promise<PlatformSettingsDocument>;
    updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettingsDocument>;
    isFreeListing(): Promise<boolean>;
    isNoCommission(): Promise<boolean>;
    getSelfListingFeePercent(): Promise<number>;
    getListingFeeCapKobo(): Promise<number>;
    getConsignmentCommissionPercent(): Promise<number>;
    getPlanPricing(): Promise<Record<string, number>>;
    getActivePlans(): Promise<Record<string, boolean>>;
    getPublicSettings(): Promise<{
        plans: Array<{
            id: string;
            priceKobo: number;
            active: boolean;
        }>;
        featureFlags: {
            selfListingEnabled: boolean;
            consignmentEnabled: boolean;
            directSaleEnabled: boolean;
            maintenanceMode: boolean;
        };
    }>;
}
