import { FollowsService } from './follows.service';
import { JwtPayload } from '@common/decorators/get-user.decorator';
import { CheckFollowDto, QueryFollowsDto, ToggleFollowDto } from './dto/follows.dto';
import { FollowTargetType } from './schema/follows.shema';
export declare class FollowsController {
    private readonly followsService;
    constructor(followsService: FollowsService);
    toggle(user: JwtPayload, toggleDto: ToggleFollowDto): Promise<{
        followed: boolean;
        totalFollowers: number;
    }>;
    check(user: JwtPayload, checkDto: CheckFollowDto): Promise<Record<string, boolean>>;
    findMyFollows(user: JwtPayload, queryDto: QueryFollowsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schema/follows.shema").FollowDocument>>;
    getCount(user: JwtPayload, targetType?: FollowTargetType): Promise<{
        count: number;
    }>;
    findFollowers(targetType: FollowTargetType, targetId: string, queryDto: QueryFollowsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<any>>;
}
