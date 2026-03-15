import { Model } from 'mongoose';
import { DeliveryZoneDocument } from './schemas/delivery-zone.schema';
import { CreateDeliveryZoneDto, UpdateDeliveryZoneDto } from './dto/delivery-zone.dto';
export declare class DeliveryZonesService {
    private readonly zoneModel;
    constructor(zoneModel: Model<DeliveryZoneDocument>);
    create(dto: CreateDeliveryZoneDto): Promise<DeliveryZoneDocument>;
    findAll(): Promise<DeliveryZoneDocument[]>;
    findActive(): Promise<DeliveryZoneDocument[]>;
    findById(id: string): Promise<DeliveryZoneDocument>;
    update(id: string, dto: UpdateDeliveryZoneDto): Promise<DeliveryZoneDocument>;
    remove(id: string): Promise<void>;
    getFeeForState(state: string): Promise<number>;
    getZoneForState(state: string): Promise<{
        zoneName: string;
        fee: number;
    } | null>;
}
