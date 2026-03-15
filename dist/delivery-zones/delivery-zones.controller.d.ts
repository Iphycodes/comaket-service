import { DeliveryZonesService } from './delivery-zones.service';
import { CreateDeliveryZoneDto, UpdateDeliveryZoneDto } from './dto/delivery-zone.dto';
export declare class DeliveryZonesController {
    private readonly zonesService;
    constructor(zonesService: DeliveryZonesService);
    getActiveZones(): Promise<import("./schemas/delivery-zone.schema").DeliveryZoneDocument[]>;
    getFeeForState(state: string): Promise<{
        zoneName: string;
        fee: number;
    }>;
    getAllZones(): Promise<import("./schemas/delivery-zone.schema").DeliveryZoneDocument[]>;
    create(dto: CreateDeliveryZoneDto): Promise<import("./schemas/delivery-zone.schema").DeliveryZoneDocument>;
    update(id: string, dto: UpdateDeliveryZoneDto): Promise<import("./schemas/delivery-zone.schema").DeliveryZoneDocument>;
    remove(id: string): Promise<void>;
}
