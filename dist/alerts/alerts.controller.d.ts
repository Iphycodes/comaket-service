import { AlertsService } from './alerts.service';
import { GetAlertsDto } from './dto/alert.dto';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getAlerts(userId: string, dto: GetAlertsDto): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/alert.schema").AlertDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        pagination: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        markedCount: number;
    }>;
    markAsRead(alertId: string, userId: string): Promise<import("./schemas/alert.schema").AlertDocument>;
    clearAll(userId: string): Promise<{
        clearedCount: number;
    }>;
    deleteAlert(alertId: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
