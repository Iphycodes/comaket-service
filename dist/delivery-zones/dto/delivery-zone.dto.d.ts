export declare class CreateDeliveryZoneDto {
    name: string;
    states: string[];
    baseFee: number;
    description?: string;
}
export declare class UpdateDeliveryZoneDto {
    name?: string;
    states?: string[];
    baseFee?: number;
    isActive?: boolean;
    description?: string;
}
