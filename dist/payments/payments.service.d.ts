import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { OrdersService } from '../orders/orders.service';
import { CartService } from '../cart/cart.service';
import { ListingDocument } from '../listings/schemas/listing.schema';
import { CreatorDocument } from '../creators/schemas/creator.schema';
import { CreatorPlan } from '@config/contants';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
export declare class PaymentsService {
    private configService;
    private ordersService;
    private cartService;
    private listingModel;
    private creatorModel;
    private platformSettingsService;
    private readonly logger;
    private readonly secretKey;
    constructor(configService: ConfigService, ordersService: OrdersService, cartService: CartService, listingModel: Model<ListingDocument>, creatorModel: Model<CreatorDocument>, platformSettingsService: PlatformSettingsService);
    private paystackRequest;
    initializeOrderPayment(orderId: string, email: string, callbackUrl?: string): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    }>;
    initializeCheckoutSessionPayment(grandTotal: number, email: string, items: Array<{
        itemName: string;
        quantity: number;
        unitPrice: number;
    }>, shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        country: string;
    }, callbackUrl?: string): Promise<{
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
    private processOrderPayment;
    private processCheckoutSession;
    handleWebhook(signature: string, payload: any): Promise<void>;
    private processListingFeePayment;
    initializeListingFeePayment(listingId: string, email: string, callbackUrl?: string): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
        pendingAmount: number;
        totalFee: number;
        previouslyPaid: number;
    }>;
    initializeSubscription(plan: string, email: string, callbackUrl?: string): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    }>;
    private findCreatorByEmail;
    private processSubscriptionPayment;
    getSubscriptionDetails(email: string): Promise<{
        plan: CreatorPlan;
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
    cancelSubscription(email: string): Promise<{
        message: string;
        plan: CreatorPlan;
        activeUntil: Date;
    }>;
    changePlan(currentEmail: string, targetPlan: string, callbackUrl?: string): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    } | {
        message: string;
        plan: CreatorPlan;
        activeUntil: Date;
    }>;
    listBanks(): Promise<any>;
    verifyBankAccount(accountNumber: string, bankCode: string): Promise<any>;
}
