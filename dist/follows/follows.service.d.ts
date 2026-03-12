import { Model } from 'mongoose';
import { FollowDocument, FollowTargetType } from './schema/follows.shema';
import { CreatorDocument } from '../creators/schemas/creator.schema';
import { StoreDocument } from '../stores/schemas/store.schema';
import { ToggleFollowDto, CheckFollowDto, QueryFollowsDto } from './dto/follows.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
export declare class FollowsService {
    private followModel;
    private creatorModel;
    private storeModel;
    constructor(followModel: Model<FollowDocument>, creatorModel: Model<CreatorDocument>, storeModel: Model<StoreDocument>);
    toggle(userId: string, dto: ToggleFollowDto): Promise<{
        followed: boolean;
        totalFollowers: number;
    }>;
    check(userId: string, dto: CheckFollowDto): Promise<Record<string, boolean>>;
    findMyFollows(userId: string, queryDto: QueryFollowsDto): Promise<PaginatedResponse<FollowDocument>>;
    findFollowers(targetType: FollowTargetType, targetId: string, queryDto: QueryFollowsDto): Promise<PaginatedResponse<any>>;
    getFollowCount(userId: string, targetType?: FollowTargetType): Promise<number>;
    private verifyTargetExists;
    private updateFollowerCount;
    private getFollowerCount;
}
