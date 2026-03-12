export declare class CreateShippingAddressDto {
    fullName: string;
    phoneNumber: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    zipCode?: string;
    label?: string;
    isDefault?: boolean;
}
declare const UpdateShippingAddressDto_base: import("@nestjs/common").Type<Partial<CreateShippingAddressDto>>;
export declare class UpdateShippingAddressDto extends UpdateShippingAddressDto_base {
}
export {};
