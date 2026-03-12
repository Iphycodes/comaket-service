import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoresDto } from './dto/store.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    create(user: JwtPayload, createStoreDto: CreateStoreDto): Promise<import("./schemas/store.schema").StoreDocument>;
    findMyStores(user: JwtPayload): Promise<import("./schemas/store.schema").StoreDocument[]>;
    update(storeId: string, user: JwtPayload, updateStoreDto: UpdateStoreDto): Promise<import("./schemas/store.schema").StoreDocument>;
    toggleVisibility(storeId: string, user: JwtPayload): Promise<{
        isVisible: boolean;
    }>;
    closeStore(storeId: string, user: JwtPayload): Promise<import("./schemas/store.schema").StoreDocument>;
    findAll(queryDto: QueryStoresDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/store.schema").StoreDocument>>;
    findByCreator(creatorId: string): Promise<import("./schemas/store.schema").StoreDocument[]>;
    findById(storeId: string): Promise<import("./schemas/store.schema").StoreDocument>;
    findBySlug(slug: string): Promise<import("./schemas/store.schema").StoreDocument>;
}
