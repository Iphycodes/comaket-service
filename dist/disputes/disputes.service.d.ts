import { Model } from 'mongoose';
import { Dispute, DisputeDocument } from './schemas/dispute.schema';
import { CreateDisputeDto, UpdateDisputeDto, AddDisputeMessageDto, QueryDisputesDto } from './dto/dispute.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
export declare class DisputesService {
    private disputeModel;
    private readonly logger;
    constructor(disputeModel: Model<DisputeDocument>);
    create(userId: string, dto: CreateDisputeDto): Promise<Dispute>;
    findMyDisputes(userId: string, query: QueryDisputesDto): Promise<PaginatedResponse<Dispute>>;
    findAll(query: QueryDisputesDto): Promise<PaginatedResponse<Dispute>>;
    findOne(id: string): Promise<Dispute>;
    update(id: string, dto: UpdateDisputeDto): Promise<Dispute>;
    addMessage(id: string, userId: string, dto: AddDisputeMessageDto): Promise<Dispute>;
    getStats(): Promise<Record<string, number>>;
    isOwner(disputeId: string, userId: string): Promise<boolean>;
}
