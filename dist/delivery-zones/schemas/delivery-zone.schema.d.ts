import { Document } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base-schema';
export type DeliveryZoneDocument = DeliveryZone & Document;
export declare class DeliveryZone extends BaseSchema {
    name: string;
    states: string[];
    baseFee: number;
    isActive: boolean;
    description: string;
}
export declare const DeliveryZoneSchema: import("mongoose").Schema<DeliveryZone, import("mongoose").Model<DeliveryZone, any, any, any, Document<unknown, any, DeliveryZone> & DeliveryZone & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DeliveryZone, Document<unknown, {}, import("mongoose").FlatRecord<DeliveryZone>> & import("mongoose").FlatRecord<DeliveryZone> & {
    _id: import("mongoose").Types.ObjectId;
}>;
