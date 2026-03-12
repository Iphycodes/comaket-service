export declare class CreateCategoryDto {
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    parentId?: string;
    sortOrder?: number;
}
declare const UpdateCategoryDto_base: import("@nestjs/common").Type<Partial<CreateCategoryDto>>;
export declare class UpdateCategoryDto extends UpdateCategoryDto_base {
    isActive?: boolean;
}
export {};
