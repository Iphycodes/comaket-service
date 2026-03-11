/**
 * orders/orders.controller.ts - Order Endpoints
 * ================================================
 * Three perspectives on orders:
 *
 * BUYER:
 *   POST   /orders              → Place an order
 *   GET    /orders/my-orders    → My purchases
 *   GET    /orders/:id          → View order details
 *
 * SELLER:
 *   GET    /orders/my-sales     → Orders for my items
 *
 * ADMIN:
 *   GET    /orders/admin/all    → All orders on platform
 *   PATCH  /orders/admin/:id/status → Update order status (ship, deliver, etc.)
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { UserRole } from '@config/contants';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  QueryOrdersDto,
} from './dto/order.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ═══════════════════════════════════════════════════════════
  // BUYER ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/orders ────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Order placed successfully')
  @ApiOperation({
    summary: 'Place an order',
    description:
      'Creates an order for a buyable listing (consignment or direct_purchase). ' +
      'Self-listed items cannot be ordered. Returns order details including ' +
      'the total amount for Paystack payment initialization.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created with status pending',
  })
  @ApiResponse({
    status: 400,
    description: 'Item not buyable or validation error',
  })
  async create(
    @GetUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.sub, createOrderDto);
  }

  // ─── GET /api/v1/orders/my-orders ───────────────────────

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my orders (buyer)',
    description:
      'Returns all orders placed by the authenticated user as a buyer. ' +
      'Can filter by status and payment status.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of buyer orders' })
  async findMyOrders(
    @GetUser() user: JwtPayload,
    @Query() queryDto: QueryOrdersDto,
  ) {
    return this.ordersService.findBuyerOrders(user.sub, queryDto);
  }

  // ═══════════════════════════════════════════════════════════
  // SELLER ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/orders/my-sales ────────────────────────

  @Get('seller-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my sales (seller)',
    description:
      'Returns all orders for items the authenticated creator sold. ' +
      'Used on the creator dashboard to manage incoming orders. ' +
      'Can filter by status, payment status, and store.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of seller orders' })
  async findMySales(
    @GetUser() user: JwtPayload,
    @Query() queryDto: QueryOrdersDto,
  ) {
    return this.ordersService.findSellerOrders(user.sub, queryDto);
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/orders/admin/all ───────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '[Admin] Get all orders',
    description: 'Returns all orders across the platform',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of all orders' })
  async findAll(@Query() queryDto: QueryOrdersDto) {
    return this.ordersService.findAll(queryDto);
  }

  // ─── PATCH /api/v1/orders/admin/:id/status ──────────────

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Order status updated')
  @ApiOperation({
    summary: '[Admin] Update order status',
    description:
      'Moves an order through the pipeline. Valid transitions: ' +
      'confirmed → processing → shipped → delivered → completed. ' +
      'When shipping, include carrier and tracking number.',
  })
  @ApiParam({ name: 'id', description: 'Order MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, updateDto);
  }

  // ─── PATCH /api/v1/orders/admin/:id/disburse ─────────────

  @Patch('admin/:id/disburse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Order marked as disbursed')
  @ApiOperation({
    summary: '[Admin] Mark order as disbursed',
    description:
      'Marks the seller payout as disbursed. Only orders with ' +
      'disbursementStatus "awaiting_disbursement" can be marked.',
  })
  @ApiParam({ name: 'id', description: 'Order MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Disbursement recorded' })
  @ApiResponse({
    status: 400,
    description: 'Order not in awaiting_disbursement state',
  })
  async markDisbursed(@Param('id') orderId: string) {
    return this.ordersService.markDisbursed(orderId);
  }

  // ═══════════════════════════════════════════════════════════
  // SHARED ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/orders/:id ─────────────────────────────
  // Must come last (dynamic param)

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get order details',
    description:
      'Returns full order details. Only accessible by the buyer, ' +
      'the seller, or an admin.',
  })
  @ApiParam({ name: 'id', description: 'Order MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to view this order',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') orderId: string, @GetUser() user: JwtPayload) {
    return this.ordersService.findById(orderId, user.sub);
  }
}
