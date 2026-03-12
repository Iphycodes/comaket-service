import { PaginationDto } from '@common/dto/pagination.dto';
import { FollowTargetType } from '../schema/follows.shema';
export declare class ToggleFollowDto {
    targetType: FollowTargetType;
    targetId: string;
}
export declare class CheckFollowDto {
    targetType: FollowTargetType;
    targetIds: string[];
}
export declare class QueryFollowsDto extends PaginationDto {
    targetType?: FollowTargetType;
    search?: string;
}
