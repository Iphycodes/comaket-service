import { PlatformSettingsService } from './platform-settings.service';
export declare class PlatformSettingsController {
    private readonly platformSettingsService;
    constructor(platformSettingsService: PlatformSettingsService);
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
