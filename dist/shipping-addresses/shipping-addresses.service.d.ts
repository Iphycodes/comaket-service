import { Model } from 'mongoose';
import { ShippingAddressDocument } from './schemas/shipping-addresses.schema';
import { CreateShippingAddressDto, UpdateShippingAddressDto } from './dto/shipping-addresses.dto';
export declare class ShippingAddressesService {
    private shippingAddressModel;
    private readonly logger;
    constructor(shippingAddressModel: Model<ShippingAddressDocument>);
    create(userId: string, dto: CreateShippingAddressDto): Promise<ShippingAddressDocument>;
    findAll(userId: string): Promise<ShippingAddressDocument[]>;
    findOne(userId: string, addressId: string): Promise<ShippingAddressDocument>;
    findDefault(userId: string): Promise<ShippingAddressDocument | null>;
    update(userId: string, addressId: string, dto: UpdateShippingAddressDto): Promise<ShippingAddressDocument>;
    setDefault(userId: string, addressId: string): Promise<ShippingAddressDocument>;
    remove(userId: string, addressId: string): Promise<void>;
}
