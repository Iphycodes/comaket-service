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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const decorators_1 = require("../common/decorators");
const payments_service_1 = require("./payments.service");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async initializePayment(user, dto) {
        return this.paymentsService.initializeOrderPayment(dto.orderId, user.email, dto.callbackUrl);
    }
    async initializeListingFee(user, dto) {
        return this.paymentsService.initializeListingFeePayment(dto.listingId, user.email, dto.callbackUrl);
    }
    async initializeSubscription(user, dto) {
        return this.paymentsService.initializeSubscription(dto.plan, user.email, dto.callbackUrl);
    }
    async verifyPayment(reference) {
        return this.paymentsService.verifyPayment(reference);
    }
    async handleWebhook(signature, payload) {
        await this.paymentsService.handleWebhook(signature, payload);
        return { received: true };
    }
    async getMySubscription(user) {
        return this.paymentsService.getSubscriptionDetails(user.email);
    }
    async cancelSubscription(user) {
        return this.paymentsService.cancelSubscription(user.email);
    }
    async changePlan(user, dto) {
        return this.paymentsService.changePlan(user.email, dto.plan, dto.callbackUrl);
    }
    async listBanks() {
        return this.paymentsService.listBanks();
    }
    async verifyBankAccount(accountNumber, bankCode) {
        return this.paymentsService.verifyBankAccount(accountNumber, bankCode);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('initialize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, decorators_1.ResponseMessage)('Payment initialized'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initialize order payment',
        description: 'Creates a Paystack transaction for an order. Returns the ' +
            'authorization URL where the user should be redirected to pay.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Returns authorizationUrl, accessCode, and reference',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order already paid' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, decorators_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.InitializePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializePayment", null);
__decorate([
    (0, common_1.Post)('listing-fee'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, decorators_1.ResponseMessage)('Listing fee payment initialized'),
    (0, swagger_1.ApiOperation)({
        summary: 'Pay self-listing fee',
        description: 'Initialize payment for a self-listing fee. ' +
            'Automatically calculates the pending amount (total fee minus already paid). ' +
            'For price increases on previously-live listings, only the difference is charged.',
    }),
    __param(0, (0, decorators_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.InitializeListingFeeDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializeListingFee", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, decorators_1.ResponseMessage)('Subscription payment initialized'),
    (0, swagger_1.ApiOperation)({
        summary: 'Subscribe to a creator plan',
        description: 'Initialize payment for a creator plan upgrade (Pro or Business). ' +
            'Redirects to Paystack for payment.',
    }),
    __param(0, (0, decorators_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.InitializeSubscriptionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializeSubscription", null);
__decorate([
    (0, common_1.Get)('verify/:reference'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a payment',
        description: 'Verifies a Paystack transaction by reference. Call this after ' +
            'the user is redirected back from Paystack to confirm the payment.',
    }),
    (0, swagger_1.ApiParam)({ name: 'reference', description: 'Paystack payment reference' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment verification result' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Headers)('x-paystack-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('my-subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, decorators_1.ResponseMessage)('Subscription details retrieved'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my subscription details',
        description: 'Returns the current subscription plan, renewal date, amount, ' +
            'payment method, status, and days remaining.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription details' }),
    __param(0, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMySubscription", null);
__decorate([
    (0, common_1.Post)('cancel-subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, decorators_1.ResponseMessage)('Subscription cancelled'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel my subscription',
        description: 'Cancels your subscription. Your plan stays active until the current ' +
            "billing period ends. After that, you'll be downgraded to Starter.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription cancelled' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No active subscription' }),
    __param(0, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)('change-plan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, decorators_1.ResponseMessage)('Plan change initiated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change subscription plan',
        description: 'Upgrade or downgrade your plan. For upgrades, a new payment ' +
            'will be initialized. For downgrade to Starter, subscription is cancelled.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Plan change processed' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid plan or already on this plan',
    }),
    __param(0, (0, decorators_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.ChangePlanDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "changePlan", null);
__decorate([
    (0, common_1.Get)('banks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'List Nigerian banks',
        description: 'Returns a list of all Nigerian banks with their codes. ' +
            'Use this to populate bank selection dropdowns.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "listBanks", null);
__decorate([
    (0, common_1.Get)('banks/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a bank account',
        description: 'Verifies a bank account number and returns the account name. ' +
            'Use this to confirm the account before saving bank details.',
    }),
    __param(0, (0, common_1.Query)('account_number')),
    __param(1, (0, common_1.Query)('bank_code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyBankAccount", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map