/**
 * payments/payments.service.ts - Paystack Payment Integration
 * =============================================================
 * Integrates with Paystack to handle all payments on Comaket:
 *
 * 1. ORDER PAYMENTS: Buyer pays for a consignment/direct_purchase item
 * 2. LISTING FEES: Seller pays the fee for self-listing an item
 * 3. SUBSCRIPTIONS: Creator upgrades their plan (Pro/Business)
 *
 * PAYSTACK FLOW:
 *
 *   Initialize → Paystack returns authorization_url
 *     ↓
 *   User pays on Paystack's hosted page
 *     ↓
 *   Two confirmation paths (we handle BOTH):
 *     Path A: Redirect → user comes back → we call /verify endpoint
 *     Path B: Webhook → Paystack POSTs to /payments/webhook
 *
 * WHY BOTH PATHS?
 *   - Redirect can fail (user closes browser, network issues)
 *   - Webhook is reliable but can be delayed
 *   - Handling both = maximum reliability
 *
 * PAYSTACK API REFERENCE:
 *   Base URL: https://api.paystack.co
 *   Auth: Bearer {SECRET_KEY} in headers
 *   All amounts in KOBO (100 kobo = ₦1)
 *
 * METADATA:
 *   We attach metadata to every Paystack transaction so when the
 *   webhook fires, we know what the payment was for:
 *   { type: 'order' | 'listing_fee' | 'subscription', id: '...' }
 */

import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as crypto from 'crypto';
import { OrdersService } from '../orders/orders.service';
import { CartService } from '../cart/cart.service';
import { Listing, ListingDocument } from '../listings/schemas/listing.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import {
  OrderStatus,
  PaymentStatus,
  CreatorPlan,
  ListingStatus,
} from '@config/contants';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';

// Paystack API base URL
const PAYSTACK_BASE = 'https://api.paystack.co';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    @Inject(forwardRef(() => CartService)) private cartService: CartService,
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    private platformSettingsService: PlatformSettingsService,
  ) {
    this.secretKey = this.configService.get<string>('app.paystack.secretKey');
  }

  // ─── Paystack HTTP Helper ────────────────────────────────

  /**
   * Make an authenticated request to the Paystack API.
   * All Paystack endpoints need the secret key in the Authorization header.
   */
  private async paystackRequest(
    method: 'get' | 'post',
    endpoint: string,
    data?: any,
  ) {
    try {
      const response = await axios({
        method,
        url: `${PAYSTACK_BASE}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `Paystack API error: ${error.response?.data?.message || error.message}`,
      );
      throw new InternalServerErrorException(
        'Payment service error. Please try again.',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ORDER PAYMENTS
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /payments/initialize
   *
   * Creates a Paystack transaction for a SINGLE order.
   * For cart checkout, use initializeCheckoutSessionPayment().
   */
  async initializeOrderPayment(
    orderId: string,
    email: string,
    callbackUrl?: string,
  ) {
    // Fetch the order
    // We pass email as userId won't work here since findById checks access
    const order = await this.ordersService.findByIdInternal(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.Success) {
      throw new BadRequestException('This order has already been paid');
    }

    // Generate a unique payment reference
    const reference = `CMK-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Save the reference on the order BEFORE calling Paystack
    // This way, when the webhook fires, we can find the order by reference
    order.paymentInfo = {
      ...order.paymentInfo,
      method: 'paystack',
      reference,
      status: 'initialized',
    };
    await order.save();

    // Initialize Paystack transaction
    const result = await this.paystackRequest(
      'post',
      '/transaction/initialize',
      {
        email,
        amount: order.totalAmount, // Already in kobo
        reference,
        callback_url:
          callbackUrl ||
          this.configService.get<string>('app.paystack.callbackUrl'),
        metadata: {
          type: 'order',
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          custom_fields: [
            {
              display_name: 'Order Number',
              variable_name: 'order_number',
              value: order.orderNumber,
            },
          ],
        },
      },
    );

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    };
  }

  // ─── Cart Checkout Session Payment ──────────────────────────

  /**
   * Initialize ONE Paystack payment for a cart checkout session.
   * No orders exist yet — they're created after payment confirms.
   *
   * Metadata includes order details so Paystack dashboard shows
   * what was purchased (items, shipping, totals).
   */
  async initializeCheckoutSessionPayment(
    grandTotal: number,
    email: string,
    items: Array<{ itemName: string; quantity: number; unitPrice: number }>,
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      country: string;
    },
    callbackUrl?: string,
  ) {
    const reference = `CMK-CHK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Build items summary for Paystack metadata
    const itemsSummary = items
      .map(
        (i) =>
          `${i.itemName} (x${i.quantity}) — ₦${(i.unitPrice / 100).toLocaleString()}`,
      )
      .join(', ');
    const shippingSummary = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}`;

    const result = await this.paystackRequest(
      'post',
      '/transaction/initialize',
      {
        email,
        amount: grandTotal, // Already in kobo
        reference,
        callback_url:
          callbackUrl ||
          this.configService.get<string>('app.paystack.callbackUrl'),
        metadata: {
          type: 'checkout_session',
          items: items.map((i) => ({
            itemName: i.itemName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          shipping: shippingAddress,
          custom_fields: [
            {
              display_name: 'Items',
              variable_name: 'items',
              value:
                itemsSummary.length > 200
                  ? itemsSummary.substring(0, 197) + '...'
                  : itemsSummary,
            },
            {
              display_name: 'Ship To',
              variable_name: 'ship_to',
              value: shippingSummary,
            },
            {
              display_name: 'Item Count',
              variable_name: 'item_count',
              value: `${items.length} item(s)`,
            },
          ],
        },
      },
    );

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PAYMENT VERIFICATION
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /payments/verify/:reference
   *
   * Called after Paystack redirects the user back.
   * Verifies the payment with Paystack's API and updates the order.
   *
   * Paystack's /transaction/verify/:reference returns:
   * {
   *   status: true,
   *   data: {
   *     status: "success" | "failed" | "abandoned",
   *     reference: "...",
   *     amount: 1500000,
   *     gateway_response: "Successful",
   *     ...
   *   }
   * }
   */
  async verifyPayment(reference: string) {
    // Verify with Paystack
    const result = await this.paystackRequest(
      'get',
      `/transaction/verify/${reference}`,
    );

    const { status: txStatus, amount } = result.data;

    // Paystack may return metadata as a string or object
    let metadata = result.data.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = {};
      }
    }
    metadata = metadata || {};

    this.logger.log(
      `Verify payment: ref=${reference}, status=${txStatus}, type=${metadata?.type}, amount=${amount}`,
    );

    if (txStatus !== 'success') {
      // Mark checkout session as failed if applicable
      if (metadata?.type === 'checkout_session') {
        await this.cartService.failCheckoutSession(reference);
      }

      return {
        verified: false,
        status: txStatus,
        message: `Payment ${txStatus}`,
      };
    }

    // Process based on payment type
    if (metadata?.type === 'order') {
      await this.processOrderPayment(
        metadata.orderId,
        reference,
        result.data.reference,
      );
    } else if (metadata?.type === 'checkout_session') {
      // Cart checkout session — look up session by reference, create orders
      await this.processCheckoutSession(reference, result.data.reference);
    } else if (metadata?.type === 'listing_fee') {
      await this.processListingFeePayment(
        metadata.listingId,
        result.data.amount,
      );
    } else if (metadata?.type === 'subscription') {
      await this.processSubscriptionPayment(
        metadata.plan,
        result.data.customer?.email,
        result.data.amount,
        reference,
        result.data.channel,
        result.data.customer?.customer_code,
      );
    }

    return {
      verified: true,
      status: 'success',
      message: 'Payment verified successfully',
      reference,
      paymentType: metadata?.type || null,
      ...(metadata?.type === 'listing_fee' && {
        listingId: metadata.listingId,
      }),
      ...(metadata?.type === 'order' && { orderId: metadata.orderId }),
      ...(metadata?.type === 'subscription' && { plan: metadata.plan }),
    };
  }

  /**
   * Process a successful single-order payment (e.g. "Buy Now").
   * Updates the order status and payment info.
   */
  private async processOrderPayment(
    orderId: string,
    reference: string,
    paystackReference: string,
  ) {
    try {
      await this.ordersService.confirmPayment(
        orderId,
        reference,
        paystackReference,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Order ${orderId} already confirmed`);
        return;
      }
      throw error;
    }
  }

  /**
   * Process a successful checkout session payment.
   * Looks up the CheckoutSession by reference → creates orders → clears cart.
   */
  private async processCheckoutSession(
    reference: string,
    paystackReference: string,
  ) {
    // Find the session by payment reference
    const session = await this.cartService.findSessionByReference(reference);

    if (!session) {
      this.logger.error(
        `No checkout session found for reference: ${reference}`,
      );
      return;
    }

    try {
      const result = await this.cartService.fulfillCheckoutSession(
        session._id.toString(),
        reference,
        paystackReference,
      );

      if (result.alreadyFulfilled) {
        this.logger.warn(`Checkout session already fulfilled: ${session._id}`);
      } else {
        this.logger.log(
          `Checkout session fulfilled: ${session._id}, ` +
            `${result.orders?.length || 0} order(s) created`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to fulfill checkout session ${session._id}: ${error.message}`,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // WEBHOOK HANDLER
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /payments/webhook
   *
   * Paystack sends webhook events for various actions.
   * The most important one is "charge.success" — a payment went through.
   *
   * SECURITY: We verify the webhook signature using HMAC.
   * Paystack signs the request body with your secret key and sends
   * the signature in the x-paystack-signature header. We compute
   * our own HMAC and compare — if they match, the webhook is genuine.
   *
   * WHY WEBHOOKS MATTER:
   * Even if the user closes their browser before being redirected back,
   * the webhook will still fire, so the order gets confirmed.
   */
  async handleWebhook(signature: string, payload: any): Promise<void> {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      this.logger.warn('Invalid webhook signature — possible forgery attempt');
      throw new BadRequestException('Invalid signature');
    }

    const { event, data } = payload;

    this.logger.log(`Paystack webhook: ${event} for ref ${data?.reference}`);

    switch (event) {
      // ─── Payment successful ──────────────────────────────
      case 'charge.success': {
        const { reference } = data;

        // Paystack may return metadata as a string or object
        let metadata = data.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = {};
          }
        }
        metadata = metadata || {};

        this.logger.log(
          `Webhook charge.success: ref=${reference}, type=${metadata?.type}, amount=${data.amount}`,
        );

        if (metadata?.type === 'order') {
          await this.processOrderPayment(
            metadata.orderId,
            reference,
            data.reference,
          );
        }

        if (metadata?.type === 'checkout_session') {
          await this.processCheckoutSession(reference, data.reference);
        }

        if (metadata?.type === 'listing_fee') {
          await this.processListingFeePayment(metadata.listingId, data.amount);
        }

        if (metadata?.type === 'subscription') {
          await this.processSubscriptionPayment(
            metadata.plan,
            data.customer?.email,
            data.amount,
            reference,
            data.channel,
            data.customer?.customer_code,
          );
        }

        break;
      }

      // ─── Payment failed ──────────────────────────────────
      case 'charge.failed': {
        this.logger.warn(`Payment failed: ${data?.reference}`);

        let failedMeta = data?.metadata;
        if (typeof failedMeta === 'string') {
          try {
            failedMeta = JSON.parse(failedMeta);
          } catch {
            failedMeta = {};
          }
        }

        // Mark checkout session as failed if applicable
        if (failedMeta?.type === 'checkout_session') {
          await this.cartService.failCheckoutSession(data.reference);
        }

        break;
      }

      // ─── Subscription events ─────────────────────────────
      case 'subscription.create': {
        this.logger.log(`Subscription created: ${data?.subscription_code}`);
        const subCustomer = data?.customer?.email;
        if (subCustomer) {
          const creator = await this.findCreatorByEmail(subCustomer);
          if (creator) {
            creator.paystackSubscriptionCode = data.subscription_code;
            creator.paystackEmailToken = data.email_token;
            creator.subscriptionStatus = 'active';
            await creator.save();
            this.logger.log(`Creator subscription linked: ${subCustomer}`);
          }
        }
        break;
      }

      case 'subscription.disable': {
        this.logger.log(`Subscription disabled: ${data?.subscription_code}`);
        const disabledCreator = await this.creatorModel
          .findOne({
            paystackSubscriptionCode: data?.subscription_code,
          })
          .exec();
        if (disabledCreator) {
          disabledCreator.subscriptionStatus = 'cancelled';
          await disabledCreator.save();
          this.logger.log(
            `Creator subscription cancelled: ${disabledCreator.username}`,
          );
        }
        break;
      }

      // ─── Transfer events (payouts to sellers) ────────────
      case 'transfer.success': {
        this.logger.log(`Transfer successful: ${data?.reference}`);
        // TODO: Mark payout as completed
        break;
      }

      case 'transfer.failed': {
        this.logger.warn(`Transfer failed: ${data?.reference}`);
        // TODO: Handle failed payout
        break;
      }

      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // LISTING FEE PAYMENT (for self-listings)
  // ═══════════════════════════════════════════════════════════

  /**
   * Process a successful listing fee payment.
   * Called by the webhook when Paystack confirms payment.
   *
   * Updates feePaidAmount and listingFeeStatus on the listing.
   * If the fee is now fully covered, marks it as 'paid'.
   */
  private async processListingFeePayment(
    listingId: string,
    amountPaidKobo: number,
  ): Promise<void> {
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) {
      this.logger.error(`Listing fee payment: listing ${listingId} not found`);
      return;
    }

    this.logger.log(
      `Processing listing fee: listingId=${listingId}, amountPaid=${amountPaidKobo}, ` +
        `currentPaid=${listing.feePaidAmount}, totalFee=${listing.listingFee}, ` +
        `currentStatus=${listing.status}, feeStatus=${listing.listingFeeStatus}`,
    );

    // Update paid amount
    listing.feePaidAmount = (listing.feePaidAmount || 0) + amountPaidKobo;

    // Check if fee is fully covered
    const totalFee = listing.listingFee || 0;
    if (totalFee === 0 || listing.feePaidAmount >= totalFee) {
      listing.listingFeeStatus = 'paid';
    }

    // If listing is awaiting_fee and fee is now fully paid, move to live
    if (
      listing.listingFeeStatus === 'paid' &&
      (listing.status === ListingStatus.AwaitingFee ||
        listing.status === ListingStatus.InReview)
    ) {
      listing.status = ListingStatus.Live;
      listing.wasLive = false;
      this.logger.log(`Listing ${listingId} moved to LIVE after fee payment`);
    }

    await listing.save();

    this.logger.log(
      `Listing fee result: ${listingId}, ` +
        `paid: ${listing.feePaidAmount}, total: ${totalFee}, ` +
        `status: ${listing.status}, feeStatus: ${listing.listingFeeStatus}`,
    );
  }

  /**
   * Initialize payment for a self-listing fee.
   * Calculates the pending amount (listingFee - feePaidAmount)
   * and sends only the difference to Paystack.
   */
  async initializeListingFeePayment(
    listingId: string,
    email: string,
    callbackUrl?: string,
  ) {
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.listingFeeStatus === 'paid') {
      throw new BadRequestException('Listing fee is already paid');
    }

    if (listing.listingFeeStatus === 'waived') {
      throw new BadRequestException('Listing fee has been waived');
    }

    if (!listing.listingFee) {
      throw new BadRequestException('No listing fee set for this listing');
    }

    // Calculate what's still owed
    const pendingAmount = listing.listingFee - (listing.feePaidAmount || 0);

    if (pendingAmount <= 0) {
      // Edge case: already paid enough
      listing.listingFeeStatus = 'paid';
      await listing.save();
      throw new BadRequestException(
        'Listing fee is already covered by previous payments',
      );
    }

    const reference = `CMK-FEE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const result = await this.paystackRequest(
      'post',
      '/transaction/initialize',
      {
        email,
        amount: pendingAmount, // Only charge the difference
        reference,
        callback_url:
          callbackUrl ||
          this.configService.get<string>('app.paystack.callbackUrl'),
        metadata: {
          type: 'listing_fee',
          listingId,
          custom_fields: [
            {
              display_name: 'Payment Type',
              variable_name: 'payment_type',
              value: 'Listing Fee',
            },
            {
              display_name: 'Amount',
              variable_name: 'fee_amount',
              value: `₦${(pendingAmount / 100).toLocaleString()}`,
            },
          ],
        },
      },
    );

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
      pendingAmount,
      totalFee: listing.listingFee,
      previouslyPaid: listing.feePaidAmount || 0,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SUBSCRIPTION PAYMENT (creator plan upgrades)
  // ═══════════════════════════════════════════════════════════

  /**
   * Initialize a subscription for a creator plan upgrade.
   * Uses Paystack's subscription API for recurring billing.
   *
   * NOTE: Paystack subscriptions require a plan to be created first
   * on your Paystack dashboard. The plan codes should be stored
   * in your .env file. For now, we'll use one-time payments
   * and handle renewal manually or via cron.
   */
  async initializeSubscription(
    plan: string,
    email: string,
    callbackUrl?: string,
  ) {
    const planPricing = await this.platformSettingsService.getPlanPricing();
    const pricing = planPricing[plan];
    if (pricing === undefined) {
      throw new BadRequestException(`Invalid plan: ${plan}`);
    }

    const reference = `CMK-SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const result = await this.paystackRequest(
      'post',
      '/transaction/initialize',
      {
        email,
        amount: pricing, // In kobo from DB settings
        reference,
        callback_url:
          callbackUrl ||
          this.configService.get<string>('app.paystack.callbackUrl'),
        metadata: {
          type: 'subscription',
          plan,
          custom_fields: [
            {
              display_name: 'Subscription Plan',
              variable_name: 'subscription_plan',
              value: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            },
          ],
        },
      },
    );

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SUBSCRIPTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Helper: find creator by their user's email.
   */
  private async findCreatorByEmail(
    email: string,
  ): Promise<CreatorDocument | null> {
    const user = await this.creatorModel.db
      .collection('users')
      .findOne({ email: email.toLowerCase() });
    if (!user) return null;
    return this.creatorModel.findOne({ userId: user._id }).exec();
  }

  /**
   * Process a successful subscription payment.
   * Updates the creator's plan, subscription status, and payment details.
   */
  private async processSubscriptionPayment(
    plan: string,
    email: string,
    amountKobo: number,
    reference: string,
    channel?: string,
    customerCode?: string,
  ): Promise<void> {
    const creator = await this.findCreatorByEmail(email);
    if (!creator) {
      this.logger.error(
        `Subscription payment: creator not found for email ${email}`,
      );
      return;
    }

    // Don't process if already on this plan with same reference
    if (creator.planPaymentReference === reference) {
      this.logger.log(`Subscription already processed: ${reference}`);
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    creator.plan = plan as CreatorPlan;
    creator.subscriptionStatus = 'active';
    creator.planStartedAt = now;
    creator.planExpiresAt = expiresAt;
    creator.planAmountPaid = amountKobo;
    creator.planPaymentReference = reference;
    creator.planPaymentChannel = channel || null;
    if (customerCode) creator.paystackCustomerCode = customerCode;

    await creator.save();

    this.logger.log(
      `Subscription activated: ${creator.username}, plan=${plan}, ` +
        `amount=${amountKobo}, expires=${expiresAt.toISOString()}`,
    );
  }

  /**
   * Get subscription details for a creator (by user email).
   */
  async getSubscriptionDetails(email: string) {
    const creator = await this.findCreatorByEmail(email);
    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    const allPricing = await this.platformSettingsService.getPlanPricing();
    const planPricing = allPricing[creator.plan] || 0;
    const now = new Date();
    const isExpired = creator.planExpiresAt && creator.planExpiresAt < now;

    return {
      plan: creator.plan,
      subscriptionStatus: isExpired ? 'expired' : creator.subscriptionStatus,
      planStartedAt: creator.planStartedAt,
      planExpiresAt: creator.planExpiresAt,
      planAmountPaid: creator.planAmountPaid,
      nextBillingAmount: planPricing,
      paymentChannel: creator.planPaymentChannel,
      paymentReference: creator.planPaymentReference,
      paystackSubscriptionCode: creator.paystackSubscriptionCode,
      isActive: creator.subscriptionStatus === 'active' && !isExpired,
      daysRemaining: creator.planExpiresAt
        ? Math.max(
            0,
            Math.ceil(
              (creator.planExpiresAt.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : null,
    };
  }

  /**
   * Cancel a creator's subscription.
   * If they have a Paystack subscription, disable it via API.
   * The plan stays active until planExpiresAt.
   */
  async cancelSubscription(email: string) {
    const creator = await this.findCreatorByEmail(email);
    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    if (creator.subscriptionStatus !== 'active') {
      throw new BadRequestException('No active subscription to cancel');
    }

    // If there's a Paystack subscription, disable it
    if (creator.paystackSubscriptionCode) {
      try {
        await this.paystackRequest('post', '/subscription/disable', {
          code: creator.paystackSubscriptionCode,
          token: creator.paystackEmailToken,
        });
        this.logger.log(
          `Paystack subscription disabled: ${creator.paystackSubscriptionCode}`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to disable Paystack subscription: ${error.message}`,
        );
        // Continue — still cancel locally
      }
    }

    creator.subscriptionStatus = 'cancelled';
    await creator.save();

    return {
      message:
        'Subscription cancelled. Your plan remains active until the current period ends.',
      plan: creator.plan,
      activeUntil: creator.planExpiresAt,
    };
  }

  /**
   * Change/upgrade a creator's plan.
   * Initializes a new payment for the target plan.
   */
  async changePlan(
    currentEmail: string,
    targetPlan: string,
    callbackUrl?: string,
  ) {
    const creator = await this.findCreatorByEmail(currentEmail);
    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    if (creator.plan === targetPlan) {
      throw new BadRequestException(`You're already on the ${targetPlan} plan`);
    }

    const allPlanPricing = await this.platformSettingsService.getPlanPricing();
    const targetPricing = allPlanPricing[targetPlan];
    if (targetPricing === undefined) {
      throw new BadRequestException(`Invalid plan: ${targetPlan}`);
    }

    if (targetPlan === CreatorPlan.Starter) {
      // Downgrade to free — cancel subscription
      return this.cancelSubscription(currentEmail);
    }

    // Cancel existing Paystack subscription if upgrading
    if (
      creator.paystackSubscriptionCode &&
      creator.subscriptionStatus === 'active'
    ) {
      try {
        await this.paystackRequest('post', '/subscription/disable', {
          code: creator.paystackSubscriptionCode,
          token: creator.paystackEmailToken,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to disable old subscription: ${error.message}`,
        );
      }
    }

    // Initialize new payment for the target plan
    return this.initializeSubscription(targetPlan, currentEmail, callbackUrl);
  }

  // ═══════════════════════════════════════════════════════════
  // PAYSTACK UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * List Nigerian banks — useful for bank detail forms.
   * Paystack maintains an up-to-date list of banks and their codes.
   */
  async listBanks() {
    const result = await this.paystackRequest('get', '/bank?country=nigeria');
    return result.data;
  }

  /**
   * Verify a bank account number with Paystack.
   * Returns the account name — used to confirm the account before saving.
   */
  async verifyBankAccount(accountNumber: string, bankCode: string) {
    const result = await this.paystackRequest(
      'get',
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    );
    return result.data;
  }
}