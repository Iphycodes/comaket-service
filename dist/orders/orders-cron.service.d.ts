import { Model } from 'mongoose';
import { OrderDocument } from './schemas/order.schema';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
export declare class OrdersCronService {
    private orderModel;
    private platformSettingsService;
    private readonly logger;
    constructor(orderModel: Model<OrderDocument>, platformSettingsService: PlatformSettingsService);
    autoCompleteDeliveredOrders(): Promise<void>;
}
