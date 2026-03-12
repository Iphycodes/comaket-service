import { Model } from 'mongoose';
import { CreatorDocument } from './schemas/creator.schema';
import { UsersService } from '../users/users.service';
import { BecomeCreatorDto, UpdateCreatorDto, BankDetailsDto, QueryCreatorsDto } from './dto/creator.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
export declare class CreatorsService {
    private creatorModel;
    private usersService;
    constructor(creatorModel: Model<CreatorDocument>, usersService: UsersService);
    private generateUniqueSlug;
    private resolvePlan;
    becomeCreator(userId: string, becomeCreatorDto: BecomeCreatorDto): Promise<CreatorDocument>;
    checkUsername(username: string): Promise<{
        available: boolean;
    }>;
    findById(creatorId: string): Promise<CreatorDocument>;
    findByUserId(userId: string): Promise<CreatorDocument>;
    findBySlug(slug: string): Promise<CreatorDocument>;
    updateProfile(userId: string, updateCreatorDto: UpdateCreatorDto): Promise<CreatorDocument>;
    updateBankDetails(userId: string, bankDetailsDto: BankDetailsDto): Promise<CreatorDocument>;
    findAll(queryDto: QueryCreatorsDto): Promise<PaginatedResponse<CreatorDocument>>;
    updateStats(creatorId: string, field: string, amount: number): Promise<void>;
    countCreators(filter?: Record<string, any>): Promise<number>;
}
