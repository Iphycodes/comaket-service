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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const axios_1 = require("axios");
const crypto = require("crypto");
const orders_service_1 = require("../orders/orders.service");
const cart_service_1 = require("../cart/cart.service");
const listing_schema_1 = require("../listings/schemas/listing.schema");
const creator_schema_1 = require("../creators/schemas/creator.schema");
const contants_1 = require("../config/contants");
const platform_settings_service_1 = require("../platform-settings/platform-settings.service");
const PAYSTACK_BASE = 'https://api.paystack.co';
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(configService, ordersService, cartService, listingModel, creatorModel, platformSettingsService) {
        this.configService = configService;
        this.ordersService = ordersService;
        this.cartService = cartService;
        this.listingModel = listingModel;
        this.creatorModel = creatorModel;
        this.platformSettingsService = platformSettingsService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.secretKey = this.configService.get('app.paystack.secretKey');
    }
    async paystackRequest(method, endpoint, data) {
        try {
            const response = await (0, axios_1.default)({
                method,
                url: `${PAYSTACK_BASE}${endpoint}`,
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                data,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Paystack API error: ${error.response?.data?.message || error.message}`);
            throw new common_1.InternalServerErrorException('Payment service error. Please try again.');
        }
    }
    async initializeOrderPayment(orderId, email, callbackUrl) {
        const order = await this.ordersService.findByIdInternal(orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.paymentStatus === contants_1.PaymentStatus.Success) {
            throw new common_1.BadRequestException('This order has already been paid');
        }
        const reference = `CMK-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        order.paymentInfo = {
            ...order.paymentInfo,
            method: 'paystack',
            reference,
            status: 'initialized',
        };
        await order.save();
        const result = await this.paystackRequest('post', '/transaction/initialize', {
            email,
            amount: order.totalAmount,
            reference,
            callback_url: callbackUrl ||
                this.configService.get('app.paystack.callbackUrl'),
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
        });
        return {
            authorizationUrl: result.data.authorization_url,
            accessCode: result.data.access_code,
            reference: result.data.reference,
        };
    }
    async initializeCheckoutSessionPayment(grandTotal, email, items, shippingAddress, callbackUrl) {
        const reference = `CMK-CHK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const itemsSummary = items
            .map((i) => `${i.itemName} (x${i.quantity}) — ₦${(i.unitPrice / 100).toLocaleString()}`)
            .join(', ');
        const shippingSummary = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}`;
        const result = await this.paystackRequest('post', '/transaction/initialize', {
            email,
            amount: grandTotal,
            reference,
            callback_url: callbackUrl ||
                this.configService.get('app.paystack.callbackUrl'),
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
                        value: itemsSummary.length > 200
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
        });
        return {
            authorizationUrl: result.data.authorization_url,
            accessCode: result.data.access_code,
            reference: result.data.reference,
        };
    }
    async verifyPayment(reference) {
        const result = await this.paystackRequest('get', `/transaction/verify/${reference}`);
        const { status: txStatus, amount } = result.data;
        let metadata = result.data.metadata;
        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            }
            catch {
                metadata = {};
            }
        }
        metadata = metadata || {};
        this.logger.log(`Verify payment: ref=${reference}, status=${txStatus}, type=${metadata?.type}, amount=${amount}`);
        if (txStatus !== 'success') {
            if (metadata?.type === 'checkout_session') {
                await this.cartService.failCheckoutSession(reference);
            }
            return {
                verified: false,
                status: txStatus,
                message: `Payment ${txStatus}`,
            };
        }
        if (metadata?.type === 'order') {
            await this.processOrderPayment(metadata.orderId, reference, result.data.reference);
        }
        else if (metadata?.type === 'checkout_session') {
            await this.processCheckoutSession(reference, result.data.reference);
        }
        else if (metadata?.type === 'listing_fee') {
            await this.processListingFeePayment(metadata.listingId, result.data.amount);
        }
        else if (metadata?.type === 'subscription') {
            await this.processSubscriptionPayment(metadata.plan, result.data.customer?.email, result.data.amount, reference, result.data.channel, result.data.customer?.customer_code);
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
    async processOrderPayment(orderId, reference, paystackReference) {
        try {
            await this.ordersService.confirmPayment(orderId, reference, paystackReference);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                this.logger.warn(`Order ${orderId} already confirmed`);
                return;
            }
            throw error;
        }
    }
    async processCheckoutSession(reference, paystackReference) {
        const session = await this.cartService.findSessionByReference(reference);
        if (!session) {
            this.logger.error(`No checkout session found for reference: ${reference}`);
            return;
        }
        try {
            const result = await this.cartService.fulfillCheckoutSession(session._id.toString(), reference, paystackReference);
            if (result.alreadyFulfilled) {
                this.logger.warn(`Checkout session already fulfilled: ${session._id}`);
            }
            else {
                this.logger.log(`Checkout session fulfilled: ${session._id}, ` +
                    `${result.orders?.length || 0} order(s) created`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to fulfill checkout session ${session._id}: ${error.message}`);
        }
    }
    async handleWebhook(signature, payload) {
        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');
        if (hash !== signature) {
            this.logger.warn('Invalid webhook signature — possible forgery attempt');
            throw new common_1.BadRequestException('Invalid signature');
        }
        const { event, data } = payload;
        this.logger.log(`Paystack webhook: ${event} for ref ${data?.reference}`);
        switch (event) {
            case 'charge.success': {
                const { reference } = data;
                let metadata = data.metadata;
                if (typeof metadata === 'string') {
                    try {
                        metadata = JSON.parse(metadata);
                    }
                    catch {
                        metadata = {};
                    }
                }
                metadata = metadata || {};
                this.logger.log(`Webhook charge.success: ref=${reference}, type=${metadata?.type}, amount=${data.amount}`);
                if (metadata?.type === 'order') {
                    await this.processOrderPayment(metadata.orderId, reference, data.reference);
                }
                if (metadata?.type === 'checkout_session') {
                    await this.processCheckoutSession(reference, data.reference);
                }
                if (metadata?.type === 'listing_fee') {
                    await this.processListingFeePayment(metadata.listingId, data.amount);
                }
                if (metadata?.type === 'subscription') {
                    await this.processSubscriptionPayment(metadata.plan, data.customer?.email, data.amount, reference, data.channel, data.customer?.customer_code);
                }
                break;
            }
            case 'charge.failed': {
                this.logger.warn(`Payment failed: ${data?.reference}`);
                let failedMeta = data?.metadata;
                if (typeof failedMeta === 'string') {
                    try {
                        failedMeta = JSON.parse(failedMeta);
                    }
                    catch {
                        failedMeta = {};
                    }
                }
                if (failedMeta?.type === 'checkout_session') {
                    await this.cartService.failCheckoutSession(data.reference);
                }
                break;
            }
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
                    this.logger.log(`Creator subscription cancelled: ${disabledCreator.username}`);
                }
                break;
            }
            case 'transfer.success': {
                this.logger.log(`Transfer successful: ${data?.reference}`);
                break;
            }
            case 'transfer.failed': {
                this.logger.warn(`Transfer failed: ${data?.reference}`);
                break;
            }
            default:
                this.logger.log(`Unhandled webhook event: ${event}`);
        }
    }
    async processListingFeePayment(listingId, amountPaidKobo) {
        const listing = await this.listingModel.findById(listingId).exec();
        if (!listing) {
            this.logger.error(`Listing fee payment: listing ${listingId} not found`);
            return;
        }
        this.logger.log(`Processing listing fee: listingId=${listingId}, amountPaid=${amountPaidKobo}, ` +
            `currentPaid=${listing.feePaidAmount}, totalFee=${listing.listingFee}, ` +
            `currentStatus=${listing.status}, feeStatus=${listing.listingFeeStatus}`);
        listing.feePaidAmount = (listing.feePaidAmount || 0) + amountPaidKobo;
        const totalFee = listing.listingFee || 0;
        if (totalFee === 0 || listing.feePaidAmount >= totalFee) {
            listing.listingFeeStatus = 'paid';
        }
        if (listing.listingFeeStatus === 'paid' &&
            (listing.status === contants_1.ListingStatus.AwaitingFee ||
                listing.status === contants_1.ListingStatus.InReview)) {
            listing.status = contants_1.ListingStatus.Live;
            listing.wasLive = false;
            this.logger.log(`Listing ${listingId} moved to LIVE after fee payment`);
        }
        await listing.save();
        this.logger.log(`Listing fee result: ${listingId}, ` +
            `paid: ${listing.feePaidAmount}, total: ${totalFee}, ` +
            `status: ${listing.status}, feeStatus: ${listing.listingFeeStatus}`);
    }
    async initializeListingFeePayment(listingId, email, callbackUrl) {
        const listing = await this.listingModel.findById(listingId).exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.listingFeeStatus === 'paid') {
            throw new common_1.BadRequestException('Listing fee is already paid');
        }
        if (listing.listingFeeStatus === 'waived') {
            throw new common_1.BadRequestException('Listing fee has been waived');
        }
        if (!listing.listingFee) {
            throw new common_1.BadRequestException('No listing fee set for this listing');
        }
        const pendingAmount = listing.listingFee - (listing.feePaidAmount || 0);
        if (pendingAmount <= 0) {
            listing.listingFeeStatus = 'paid';
            await listing.save();
            throw new common_1.BadRequestException('Listing fee is already covered by previous payments');
        }
        const reference = `CMK-FEE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const result = await this.paystackRequest('post', '/transaction/initialize', {
            email,
            amount: pendingAmount,
            reference,
            callback_url: callbackUrl ||
                this.configService.get('app.paystack.callbackUrl'),
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
        });
        return {
            authorizationUrl: result.data.authorization_url,
            accessCode: result.data.access_code,
            reference: result.data.reference,
            pendingAmount,
            totalFee: listing.listingFee,
            previouslyPaid: listing.feePaidAmount || 0,
        };
    }
    async initializeSubscription(plan, email, callbackUrl) {
        const planPricing = await this.platformSettingsService.getPlanPricing();
        const pricing = planPricing[plan];
        if (pricing === undefined) {
            throw new common_1.BadRequestException(`Invalid plan: ${plan}`);
        }
        const reference = `CMK-SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const result = await this.paystackRequest('post', '/transaction/initialize', {
            email,
            amount: pricing,
            reference,
            callback_url: callbackUrl ||
                this.configService.get('app.paystack.callbackUrl'),
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
        });
        return {
            authorizationUrl: result.data.authorization_url,
            accessCode: result.data.access_code,
            reference: result.data.reference,
        };
    }
    async findCreatorByEmail(email) {
        const user = await this.creatorModel.db
            .collection('users')
            .findOne({ email: email.toLowerCase() });
        if (!user)
            return null;
        return this.creatorModel.findOne({ userId: user._id }).exec();
    }
    async processSubscriptionPayment(plan, email, amountKobo, reference, channel, customerCode) {
        const creator = await this.findCreatorByEmail(email);
        if (!creator) {
            this.logger.error(`Subscription payment: creator not found for email ${email}`);
            return;
        }
        if (creator.planPaymentReference === reference) {
            this.logger.log(`Subscription already processed: ${reference}`);
            return;
        }
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        creator.plan = plan;
        creator.subscriptionStatus = 'active';
        creator.planStartedAt = now;
        creator.planExpiresAt = expiresAt;
        creator.planAmountPaid = amountKobo;
        creator.planPaymentReference = reference;
        creator.planPaymentChannel = channel || null;
        if (customerCode)
            creator.paystackCustomerCode = customerCode;
        await creator.save();
        this.logger.log(`Subscription activated: ${creator.username}, plan=${plan}, ` +
            `amount=${amountKobo}, expires=${expiresAt.toISOString()}`);
    }
    async getSubscriptionDetails(email) {
        const creator = await this.findCreatorByEmail(email);
        if (!creator) {
            throw new common_1.NotFoundException('Creator profile not found');
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
                ? Math.max(0, Math.ceil((creator.planExpiresAt.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)))
                : null,
        };
    }
    async cancelSubscription(email) {
        const creator = await this.findCreatorByEmail(email);
        if (!creator) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        if (creator.subscriptionStatus !== 'active') {
            throw new common_1.BadRequestException('No active subscription to cancel');
        }
        if (creator.paystackSubscriptionCode) {
            try {
                await this.paystackRequest('post', '/subscription/disable', {
                    code: creator.paystackSubscriptionCode,
                    token: creator.paystackEmailToken,
                });
                this.logger.log(`Paystack subscription disabled: ${creator.paystackSubscriptionCode}`);
            }
            catch (error) {
                this.logger.warn(`Failed to disable Paystack subscription: ${error.message}`);
            }
        }
        creator.subscriptionStatus = 'cancelled';
        await creator.save();
        return {
            message: 'Subscription cancelled. Your plan remains active until the current period ends.',
            plan: creator.plan,
            activeUntil: creator.planExpiresAt,
        };
    }
    async changePlan(currentEmail, targetPlan, callbackUrl) {
        const creator = await this.findCreatorByEmail(currentEmail);
        if (!creator) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        if (creator.plan === targetPlan) {
            throw new common_1.BadRequestException(`You're already on the ${targetPlan} plan`);
        }
        const allPlanPricing = await this.platformSettingsService.getPlanPricing();
        const targetPricing = allPlanPricing[targetPlan];
        if (targetPricing === undefined) {
            throw new common_1.BadRequestException(`Invalid plan: ${targetPlan}`);
        }
        if (targetPlan === contants_1.CreatorPlan.Starter) {
            return this.cancelSubscription(currentEmail);
        }
        if (creator.paystackSubscriptionCode &&
            creator.subscriptionStatus === 'active') {
            try {
                await this.paystackRequest('post', '/subscription/disable', {
                    code: creator.paystackSubscriptionCode,
                    token: creator.paystackEmailToken,
                });
            }
            catch (error) {
                this.logger.warn(`Failed to disable old subscription: ${error.message}`);
            }
        }
        return this.initializeSubscription(targetPlan, currentEmail, callbackUrl);
    }
    async listBanks() {
        const result = await this.paystackRequest('get', '/bank?country=nigeria');
        return result.data;
    }
    async verifyBankAccount(accountNumber, bankCode) {
        const result = await this.paystackRequest('get', `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
        return result.data;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => cart_service_1.CartService))),
    __param(3, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __param(4, (0, mongoose_1.InjectModel)(creator_schema_1.Creator.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        orders_service_1.OrdersService,
        cart_service_1.CartService,
        mongoose_2.Model,
        mongoose_2.Model,
        platform_settings_service_1.PlatformSettingsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map