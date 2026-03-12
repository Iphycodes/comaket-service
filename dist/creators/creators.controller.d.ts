import { CreatorsService } from './creators.service';
import { BecomeCreatorDto, UpdateCreatorDto, BankDetailsDto, QueryCreatorsDto } from './dto/creator.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class CreatorsController {
    private readonly creatorsService;
    constructor(creatorsService: CreatorsService);
    becomeCreator(user: JwtPayload, becomeCreatorDto: BecomeCreatorDto): Promise<import("./schemas/creator.schema").CreatorDocument>;
    getMyProfile(user: JwtPayload): Promise<import("./schemas/creator.schema").CreatorDocument>;
    updateMyProfile(user: JwtPayload, updateCreatorDto: UpdateCreatorDto): Promise<import("./schemas/creator.schema").CreatorDocument>;
    updateBankDetails(user: JwtPayload, bankDetailsDto: BankDetailsDto): Promise<import("./schemas/creator.schema").CreatorDocument>;
    findAll(queryDto: QueryCreatorsDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/creator.schema").CreatorDocument>>;
    checkUsername(username: string): Promise<{
        available: boolean;
    }>;
    findBySlug(slug: string): Promise<import("./schemas/creator.schema").CreatorDocument>;
}
