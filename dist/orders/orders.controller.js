"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const contants_1 = require("../config/contants");
const orders_service_1 = require("./orders.service");
const order_dto_1 = require("./dto/order.dto");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(user, createOrderDto) {
        return this.ordersService.create(user.sub, createOrderDto);
    }
    async findMyOrders(user, queryDto) {
        return this.ordersService.findBuyerOrders(user.sub, queryDto);
    }
    async findMySales(user, queryDto) {
        return this.ordersService.findSellerOrders(user.sub, queryDto);
    }
    async findAll(queryDto) {
        return this.ordersService.findAll(queryDto);
    }
    async updateStatus(orderId, updateDto) {
        return this.ordersService.updateStatus(orderId, updateDto);
    }
    async markDisbursed(orderId) {
        return this.ordersService.markDisbursed(orderId);
    }
    async findOne(orderId, user) {
        return this.ordersService.findById(orderId, user.sub);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Order placed successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Place an order',
        description: 'Creates an order for a buyable listing (consignment or direct_purchase). ' +
            'Self-listed items cannot be ordered. Returns order details including ' +
            'the total amount for Paystack payment initialization.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Order created with status pending',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Item not buyable or validation error',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my orders (buyer)',
        description: 'Returns all orders placed by the authenticated user as a buyer. ' +
            'Can filter by status and payment status.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of buyer orders' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findMyOrders", null);
__decorate([
    (0, common_1.Get)('seller-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my sales (seller)',
        description: 'Returns all orders for items the authenticated creator sold. ' +
            'Used on the creator dashboard to manage incoming orders. ' +
            'Can filter by status, payment status, and store.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of seller orders' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findMySales", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '[Admin] Get all orders',
        description: 'Returns all orders across the platform',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of all orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('admin/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Order status updated'),
    (0, swagger_1.ApiOperation)({
        summary: '[Admin] Update order status',
        description: 'Moves an order through the pipeline. Valid transitions: ' +
            'confirmed → processing → shipped → delivered → completed. ' +
            'When shipping, include carrier and tracking number.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order status updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('admin/:id/disburse'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(contants_1.UserRole.Admin, contants_1.UserRole.SuperAdmin),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('Order marked as disbursed'),
    (0, swagger_1.ApiOperation)({
        summary: '[Admin] Mark order as disbursed',
        description: 'Marks the seller payout as disbursed. Only orders with ' +
            'disbursementStatus "awaiting_disbursement" can be marked.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disbursement recorded' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Order not in awaiting_disbursement state',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "markDisbursed", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get order details',
        description: 'Returns full order details. Only accessible by the buyer, ' +
            'the seller, or an admin.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order MongoDB ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to view this order',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map