import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createDto: CreateCategoryDto): Promise<import("./schema/categories.schema").CategoryDocument>;
    update(id: string, updateDto: UpdateCategoryDto): Promise<import("./schema/categories.schema").CategoryDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findAll(): Promise<import("./schema/categories.schema").CategoryDocument[]>;
    getTree(): Promise<any[]>;
    findBySlug(slug: string): Promise<import("./schema/categories.schema").CategoryDocument>;
    findChildren(id: string): Promise<import("./schema/categories.schema").CategoryDocument[]>;
}
