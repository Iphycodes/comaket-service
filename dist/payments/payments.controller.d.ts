import { JwtPayload } from '@common/decorators';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, InitializeListingFeeDto, InitializeSubscriptionDto, ChangePlanDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initializePayment(user: JwtPayload, dto: InitializePaymentDto): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    }>;
    initializeOPayPayment(user: JwtPayload, dto: InitializePaymentDto): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    }>;
    initializeListingFee(user: JwtPayload, dto: InitializeListingFeeDto): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
        pendingAmount: number;
        totalFee: number;
        previouslyPaid: number;
    }>;
    initializeSubscription(user: JwtPayload, dto: InitializeSubscriptionDto): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    }>;
    verifyPayment(reference: string): Promise<{
        verified: boolean;
        status: any;
        message: string;
    } | {
        plan: any;
        orderId: any;
        listingId: any;
        verified: boolean;
        status: string;
        message: string;
        reference: string;
        paymentType: any;
    }>;
    handleWebhook(signature: string, payload: any): Promise<{
        received: boolean;
    }>;
    handleOPayWebhook(signature: string, payload: any): Promise<{
        received: boolean;
    }>;
    verifyOPayPayment(reference: string): Promise<{
        verified: boolean;
        status: string;
        message: string;
        reference: any;
    } | {
        verified: boolean;
        status: any;
        message: string;
        reference?: undefined;
    }>;
    getMySubscription(user: JwtPayload): Promise<{
        plan: import("../config/contants").CreatorPlan;
        subscriptionStatus: string;
        planStartedAt: Date;
        planExpiresAt: Date;
        planAmountPaid: number;
        nextBillingAmount: number;
        paymentChannel: string;
        paymentReference: string;
        paystackSubscriptionCode: string;
        isActive: boolean;
        daysRemaining: number;
    }>;
    cancelSubscription(user: JwtPayload): Promise<{
        message: string;
        plan: import("../config/contants").CreatorPlan;
        activeUntil: Date;
    }>;
    changePlan(user: JwtPayload, dto: ChangePlanDto): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    } | {
        message: string;
        plan: import("../config/contants").CreatorPlan;
        activeUntil: Date;
    }>;
    listBanks(): Promise<any>;
    verifyBankAccount(accountNumber: string, bankCode: string): Promise<any>;
}
