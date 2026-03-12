import { Model } from 'mongoose';
import { CategoryDocument } from './schema/categories.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
export declare class CategoriesService {
    private categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    private generateSlug;
    create(createDto: CreateCategoryDto): Promise<CategoryDocument>;
    update(categoryId: string, updateDto: UpdateCategoryDto): Promise<CategoryDocument>;
    remove(categoryId: string): Promise<{
        message: string;
    }>;
    findAll(activeOnly?: boolean): Promise<CategoryDocument[]>;
    getTree(): Promise<any[]>;
    findBySlug(slug: string): Promise<CategoryDocument>;
    findChildren(parentId: string): Promise<CategoryDocument[]>;
    updateListingCount(categorySlug: string, amount: number): Promise<void>;
}
