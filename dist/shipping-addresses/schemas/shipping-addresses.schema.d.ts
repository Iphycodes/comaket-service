import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export type ShippingAddressDocument = ShippingAddress & Document;
export declare class ShippingAddress extends BaseSchema {
    userId: Types.ObjectId;
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    label: string;
    isDefault: boolean;
}
export declare const ShippingAddressSchema: import("mongoose").Schema<ShippingAddress, import("mongoose").Model<ShippingAddress, any, any, any, Document<unknown, any, ShippingAddress> & ShippingAddress & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ShippingAddress, Document<unknown, {}, import("mongoose").FlatRecord<ShippingAddress>> & import("mongoose").FlatRecord<ShippingAddress> & {
    _id: Types.ObjectId;
}>;
