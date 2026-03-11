/**
 * payments/dto/payment.dto.ts - Payment DTOs
 * =============================================
 * Data shapes for Paystack payment operations.
 *
 * HOW PAYSTACK WORKS (quick overview):
 *
 * 1. Frontend: User clicks "Pay Now"
 * 2. Backend: POST /payments/initialize → returns Paystack authorization_url
 * 3. Frontend: Redirects user to Paystack's hosted payment page
 * 4. User: Enters card details on Paystack's page (we never see card data)
 * 5. Paystack: Processes payment, redirects user back to our callback URL
 * 6. Backend: GET /payments/verify/:reference → confirms with Paystack API
 * 7. Paystack: Also sends a webhook (POST /payments/webhook) as backup
 *
 * We handle BOTH verification (step 6) and webhook (step 7) because:
 * - Verification: immediate, triggered by redirect
 * - Webhook: reliable, works even if user closes browser before redirect
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// ═══════════════════════════════════════════════════════════════
// INITIALIZE PAYMENT - Start a Paystack transaction
// ═══════════════════════════════════════════════════════════════

export class InitializePaymentDto {
  @ApiProperty({
    description: 'Order ID to pay for',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after payment (overrides default)',
    example: 'https://comaket.com/orders/confirmation',
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE LISTING FEE - Pay the self-listing fee
// ═══════════════════════════════════════════════════════════════

export class InitializeListingFeeDto {
  @ApiProperty({
    description: 'Listing ID to pay the listing fee for',
  })
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after payment',
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE SUBSCRIPTION - Creator plan upgrade
// ═══════════════════════════════════════════════════════════════

export class InitializeSubscriptionDto {
  @ApiProperty({
    description: 'Plan to subscribe to',
    enum: ['pro', 'business'],
  })
  @IsString()
  @IsNotEmpty()
  plan: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after payment',
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// CHANGE PLAN - Upgrade or downgrade subscription
// ═══════════════════════════════════════════════════════════════

export class ChangePlanDto {
  @ApiProperty({
    description: 'Target plan to switch to',
    enum: ['starter', 'pro', 'business'],
  })
  @IsString()
  @IsNotEmpty()
  plan: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after payment (for upgrades)',
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}