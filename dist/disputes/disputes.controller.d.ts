import { DisputesService } from './disputes.service';
import { CreateDisputeDto, UpdateDisputeDto, AddDisputeMessageDto, QueryDisputesDto } from './dto/dispute.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class DisputesController {
    private readonly disputesService;
    constructor(disputesService: DisputesService);
    create(user: JwtPayload, createDisputeDto: CreateDisputeDto): Promise<import("./schemas/dispute.schema").Dispute>;
    findMyDisputes(user: JwtPayload, query: QueryDisputesDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/dispute.schema").Dispute>>;
    getStats(): Promise<Record<string, number>>;
    findAll(query: QueryDisputesDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/dispute.schema").Dispute>>;
    findOne(user: JwtPayload, id: string): Promise<import("./schemas/dispute.schema").Dispute>;
    update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<import("./schemas/dispute.schema").Dispute>;
    addMessage(user: JwtPayload, id: string, dto: AddDisputeMessageDto): Promise<import("./schemas/dispute.schema").Dispute>;
    private assertOwnerOrAdmin;
}
