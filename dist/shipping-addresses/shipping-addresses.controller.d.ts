import { ShippingAddressesService } from './shipping-addresses.service';
import { CreateShippingAddressDto, UpdateShippingAddressDto } from './dto/shipping-addresses.dto';
export declare class ShippingAddressesController {
    private readonly shippingAddressesService;
    constructor(shippingAddressesService: ShippingAddressesService);
    create(req: any, dto: CreateShippingAddressDto): Promise<import("./schemas/shipping-addresses.schema").ShippingAddressDocument>;
    findAll(req: any): Promise<import("./schemas/shipping-addresses.schema").ShippingAddressDocument[]>;
    findDefault(req: any): Promise<import("./schemas/shipping-addresses.schema").ShippingAddressDocument>;
    findOne(req: any, id: string): Promise<import("./schemas/shipping-addresses.schema").ShippingAddressDocument>;
    update(req: any, id: string, dto: UpdateShippingAddressDto): Promise<import("./schemas/shipping-addresses.schema").ShippingAddressDocument>;
    setDefault(req: any, id: string): Promise<import("./schemas/shipping-addresses.schema").ShippingAddressDocument>;
    remove(req: any, id: string): Promise<void>;
}
