import { FeaturedWorksService } from './featured-works.service';
import { JwtPayload } from '@common/decorators/get-user.decorator';
import { CreateFeaturedWorkDto, UpdateFeaturedWorkDto, ReorderFeaturedWorksDto, QueryFeaturedWorksDto } from './dto/featured-works.dto';
import { FeaturedWorkOwnerType } from './schema/featured-works.schema';
export declare class FeaturedWorksController {
    private readonly featuredWorksService;
    constructor(featuredWorksService: FeaturedWorksService);
    create(user: JwtPayload, dto: CreateFeaturedWorkDto): Promise<import("./schema/featured-works.schema").FeaturedWorkDocument>;
    reorder(user: JwtPayload, dto: ReorderFeaturedWorksDto): Promise<import("./schema/featured-works.schema").FeaturedWorkDocument[]>;
    update(user: JwtPayload, workId: string, dto: UpdateFeaturedWorkDto): Promise<import("./schema/featured-works.schema").FeaturedWorkDocument>;
    removeAll(user: JwtPayload, ownerType: FeaturedWorkOwnerType, ownerId: string): Promise<{
        deletedCount: number;
    }>;
    remove(user: JwtPayload, workId: string): Promise<{
        deleted: true;
    }>;
    count(ownerType: FeaturedWorkOwnerType, ownerId: string): Promise<{
        count: number;
        limit: number;
        plan: import("../config/contants").CreatorPlan;
    }>;
    findByOwner(queryDto: QueryFeaturedWorksDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schema/featured-works.schema").FeaturedWorkDocument>>;
    findById(workId: string): Promise<import("./schema/featured-works.schema").FeaturedWorkDocument>;
}
