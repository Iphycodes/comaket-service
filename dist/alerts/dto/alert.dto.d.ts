import { PaginationDto } from '../../common/dto/pagination.dto';
import { AlertType } from '../../config/contants';
export declare class GetAlertsDto extends PaginationDto {
    isRead?: string;
    type?: AlertType;
}
