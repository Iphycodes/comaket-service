import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrdersDto } from './dto/order.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: JwtPayload, createOrderDto: CreateOrderDto): Promise<import("./schemas/order.schema").OrderDocument>;
    findMyOrders(user: JwtPayload, queryDto: QueryOrdersDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/order.schema").OrderDocument>>;
    findMySales(user: JwtPayload, queryDto: QueryOrdersDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/order.schema").OrderDocument>>;
    findAll(queryDto: QueryOrdersDto): Promise<import("../common/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/order.schema").OrderDocument>>;
    updateStatus(orderId: string, updateDto: UpdateOrderStatusDto): Promise<import("./schemas/order.schema").OrderDocument>;
    markDisbursed(orderId: string): Promise<import("./schemas/order.schema").OrderDocument>;
    findOne(orderId: string, user: JwtPayload): Promise<import("./schemas/order.schema").OrderDocument>;
}
