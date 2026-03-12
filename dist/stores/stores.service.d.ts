import { Model } from 'mongoose';
import { StoreDocument } from './schemas/store.schema';
import { CreatorDocument } from '../creators/schemas/creator.schema';
import { CreatorsService } from '../creators/creators.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoresDto } from './dto/store.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
export declare class StoresService {
    private storeModel;
    private creatorModel;
    private creatorsService;
    constructor(storeModel: Model<StoreDocument>, creatorModel: Model<CreatorDocument>, creatorsService: CreatorsService);
    private generateUniqueSlug;
    private verifyOwnership;
    create(userId: string, createStoreDto: CreateStoreDto): Promise<StoreDocument>;
    findById(storeId: string): Promise<StoreDocument>;
    findBySlug(slug: string): Promise<StoreDocument>;
    findMyStores(userId: string): Promise<StoreDocument[]>;
    findByCreatorId(creatorId: string): Promise<StoreDocument[]>;
    update(storeId: string, userId: string, updateStoreDto: UpdateStoreDto): Promise<StoreDocument>;
    toggleVisibility(storeId: string, userId: string): Promise<{
        isVisible: boolean;
    }>;
    closeStore(storeId: string, userId: string): Promise<StoreDocument>;
    findAll(queryDto: QueryStoresDto): Promise<PaginatedResponse<StoreDocument>>;
    updateStats(storeId: string, field: string, amount: number): Promise<void>;
    countStores(filter?: Record<string, any>): Promise<number>;
}
