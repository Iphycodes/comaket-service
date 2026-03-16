import { PaginationDto } from '@common/dto/pagination.dto';
import { DisputeType, DisputeStatus, DisputePriority } from '../schemas/dispute.schema';
export declare class CreateDisputeDto {
    type: DisputeType;
    subject: string;
    description: string;
    orderId?: string;
    attachments?: string[];
}
export declare class UpdateDisputeDto {
    status?: DisputeStatus;
    resolution?: string;
    priority?: DisputePriority;
    assignedTo?: string;
}
export declare class AddDisputeMessageDto {
    message: string;
}
export declare class QueryDisputesDto extends PaginationDto {
    status?: DisputeStatus;
    type?: DisputeType;
    priority?: DisputePriority;
}
