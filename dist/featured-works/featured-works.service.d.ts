import { Model } from 'mongoose';
import { FeaturedWorkDocument, FeaturedWorkOwnerType } from './schema/featured-works.schema';
import { CreatorDocument } from '../creators/schemas/creator.schema';
import { StoreDocument } from '../stores/schemas/store.schema';
import { CreateFeaturedWorkDto, UpdateFeaturedWorkDto, ReorderFeaturedWorksDto, QueryFeaturedWorksDto } from './dto/featured-works.dto';
import { CreatorPlan } from '@config/contants';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
export declare class FeaturedWorksService {
    private featuredWorkModel;
    private creatorModel;
    private storeModel;
    constructor(featuredWorkModel: Model<FeaturedWorkDocument>, creatorModel: Model<CreatorDocument>, storeModel: Model<StoreDocument>);
    create(userId: string, dto: CreateFeaturedWorkDto): Promise<FeaturedWorkDocument>;
    update(userId: string, workId: string, dto: UpdateFeaturedWorkDto): Promise<FeaturedWorkDocument>;
    remove(userId: string, workId: string): Promise<{
        deleted: true;
    }>;
    removeAll(userId: string, ownerType: FeaturedWorkOwnerType, ownerId: string): Promise<{
        deletedCount: number;
    }>;
    reorder(userId: string, dto: ReorderFeaturedWorksDto): Promise<FeaturedWorkDocument[]>;
    findByOwner(queryDto: QueryFeaturedWorksDto): Promise<PaginatedResponse<FeaturedWorkDocument>>;
    findById(workId: string): Promise<FeaturedWorkDocument>;
    countByOwner(ownerType: FeaturedWorkOwnerType, ownerId: string): Promise<{
        count: number;
        limit: number;
        plan: CreatorPlan;
    }>;
    private verifyOwnershipAndGetPlan;
    private getOwnerPlan;
    private syncParentArray;
}
