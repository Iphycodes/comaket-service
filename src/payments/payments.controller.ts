/**
 * payments/payments.controller.ts - Payment Endpoints
 * ======================================================
 * Handles all Paystack payment operations.
 *
 * FLOW FOR BUYING AN ITEM:
 *   1. POST /payments/initialize      → Get Paystack checkout URL
 *   2. User pays on Paystack page
 *   3. GET /payments/verify/:ref       → Confirm payment succeeded
 *   4. POST /payments/webhook          → Backup confirmation from Paystack
 *
 * IMPORTANT: The webhook endpoint must be PUBLIC (no JWT) because
 * Paystack's servers are calling it, not a logged-in user.
 * We verify authenticity via HMAC signature instead.
 *
 * ALSO IMPORTANT: The webhook must return 200 quickly.
 * If we take too long, Paystack will retry, potentially causing
 * duplicate processing. That's why confirmPayment() is idempotent
 * (calling it twice on the same order is safe).
 */

import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, JwtPayload, ResponseMessage } from '@common/decorators';
import { PaymentsService } from './payments.service';
import {
  InitializePaymentDto,
  InitializeListingFeeDto,
  InitializeSubscriptionDto,
  ChangePlanDto,
} from './dto/payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ═══════════════════════════════════════════════════════════
  // ORDER PAYMENT
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/payments/initialize ───────────────────

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Payment initialized')
  @ApiOperation({
    summary: 'Initialize order payment',
    description:
      'Creates a Paystack transaction for an order. Returns the ' +
      'authorization URL where the user should be redirected to pay.',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns authorizationUrl, accessCode, and reference',
  })
  @ApiResponse({ status: 400, description: 'Order already paid' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async initializePayment(
    @GetUser() user: JwtPayload,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsService.initializeOrderPayment(
      dto.orderId,
      user.email,
      dto.callbackUrl,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LISTING FEE PAYMENT
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/payments/listing-fee ──────────────────

  @Post('listing-fee')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Listing fee payment initialized')
  @ApiOperation({
    summary: 'Pay self-listing fee',
    description:
      'Initialize payment for a self-listing fee. ' +
      'Automatically calculates the pending amount (total fee minus already paid). ' +
      'For price increases on previously-live listings, only the difference is charged.',
  })
  async initializeListingFee(
    @GetUser() user: JwtPayload,
    @Body() dto: InitializeListingFeeDto,
  ) {
    return this.paymentsService.initializeListingFeePayment(
      dto.listingId,
      user.email,
      dto.callbackUrl,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SUBSCRIPTION PAYMENT
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/payments/subscribe ────────────────────

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Subscription payment initialized')
  @ApiOperation({
    summary: 'Subscribe to a creator plan',
    description:
      'Initialize payment for a creator plan upgrade (Pro or Business). ' +
      'Redirects to Paystack for payment.',
  })
  async initializeSubscription(
    @GetUser() user: JwtPayload,
    @Body() dto: InitializeSubscriptionDto,
  ) {
    return this.paymentsService.initializeSubscription(
      dto.plan,
      user.email,
      dto.callbackUrl,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VERIFICATION
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/payments/verify/:reference ─────────────

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify a payment',
    description:
      'Verifies a Paystack transaction by reference. Call this after ' +
      'the user is redirected back from Paystack to confirm the payment.',
  })
  @ApiParam({ name: 'reference', description: 'Paystack payment reference' })
  @ApiResponse({ status: 200, description: 'Payment verification result' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  // ═══════════════════════════════════════════════════════════
  // WEBHOOK (PUBLIC — no JWT)
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/payments/webhook ──────────────────────

  @Post('webhook')
  @HttpCode(200) // Paystack expects 200, not 201
  @ApiExcludeEndpoint() // Don't show in Swagger (it's for Paystack, not humans)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: any,
  ) {
    await this.paymentsService.handleWebhook(signature, payload);
    // Return 200 quickly — Paystack retries if we're slow
    return { received: true };
  }

  // ═══════════════════════════════════════════════════════════
  // SUBSCRIPTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/payments/my-subscription ─────────────────

  @Get('my-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Subscription details retrieved')
  @ApiOperation({
    summary: 'Get my subscription details',
    description:
      'Returns the current subscription plan, renewal date, amount, ' +
      'payment method, status, and days remaining.',
  })
  @ApiResponse({ status: 200, description: 'Subscription details' })
  async getMySubscription(@GetUser() user: JwtPayload) {
    return this.paymentsService.getSubscriptionDetails(user.email);
  }

  // ─── POST /api/v1/payments/cancel-subscription ────────────

  @Post('cancel-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Subscription cancelled')
  @ApiOperation({
    summary: 'Cancel my subscription',
    description:
      'Cancels your subscription. Your plan stays active until the current ' +
      "billing period ends. After that, you'll be downgraded to Starter.",
  })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  @ApiResponse({ status: 400, description: 'No active subscription' })
  async cancelSubscription(@GetUser() user: JwtPayload) {
    return this.paymentsService.cancelSubscription(user.email);
  }

  // ─── POST /api/v1/payments/change-plan ────────────────────

  @Post('change-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Plan change initiated')
  @ApiOperation({
    summary: 'Change subscription plan',
    description:
      'Upgrade or downgrade your plan. For upgrades, a new payment ' +
      'will be initialized. For downgrade to Starter, subscription is cancelled.',
  })
  @ApiResponse({ status: 200, description: 'Plan change processed' })
  @ApiResponse({
    status: 400,
    description: 'Invalid plan or already on this plan',
  })
  async changePlan(@GetUser() user: JwtPayload, @Body() dto: ChangePlanDto) {
    return this.paymentsService.changePlan(
      user.email,
      dto.plan,
      dto.callbackUrl,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // BANK UTILITIES
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/payments/banks ─────────────────────────

  @Get('banks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List Nigerian banks',
    description:
      'Returns a list of all Nigerian banks with their codes. ' +
      'Use this to populate bank selection dropdowns.',
  })
  async listBanks() {
    return this.paymentsService.listBanks();
  }

  // ─── GET /api/v1/payments/banks/verify ──────────────────

  @Get('banks/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify a bank account',
    description:
      'Verifies a bank account number and returns the account name. ' +
      'Use this to confirm the account before saving bank details.',
  })
  async verifyBankAccount(
    @Query('account_number') accountNumber: string,
    @Query('bank_code') bankCode: string,
  ) {
    return this.paymentsService.verifyBankAccount(accountNumber, bankCode);
  }
}