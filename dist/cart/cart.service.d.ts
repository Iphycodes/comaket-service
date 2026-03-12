import { Model, Types } from 'mongoose';
import { CartDocument } from './schema/cart.schema';
import { CheckoutSession, CheckoutSessionDocument } from './schema/checkout-session.schema';
import { ListingDocument } from '../listings/schemas/listing.schema';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
export declare class CartService {
    private cartModel;
    private checkoutSessionModel;
    private listingModel;
    private ordersService;
    private paymentsService;
    private readonly logger;
    constructor(cartModel: Model<CartDocument>, checkoutSessionModel: Model<CheckoutSessionDocument>, listingModel: Model<ListingDocument>, ordersService: OrdersService, paymentsService: PaymentsService);
    addToCart(userId: string, listingId: string, quantity?: number): Promise<{
        items: any;
        itemCount: any;
        subtotal: any;
        currency: string;
        hasIssues: boolean;
    }>;
    getCart(userId: string): Promise<{
        items: any;
        itemCount: any;
        subtotal: any;
        currency: string;
        hasIssues: boolean;
    } | {
        items: any[];
        itemCount: number;
        subtotal: number;
        currency: string;
    }>;
    updateQuantity(userId: string, listingId: string, quantity: number): Promise<{
        items: any;
        itemCount: any;
        subtotal: any;
        currency: string;
        hasIssues: boolean;
    }>;
    removeItem(userId: string, listingId: string): Promise<{
        items: any;
        itemCount: any;
        subtotal: any;
        currency: string;
        hasIssues: boolean;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
        items: any[];
        itemCount: number;
        subtotal: number;
    }>;
    validateCart(userId: string): Promise<{
        valid: boolean;
        validItems: number;
        totalItems: number;
        issues: any[];
    }>;
    checkout(userId: string, email: string, shippingAddress: any, listingIds?: string[], buyerNote?: string, callbackUrl?: string): Promise<{
        sessionId: any;
        payment: {
            authorizationUrl: any;
            accessCode: any;
            reference: any;
            grandTotal: any;
        };
        itemCount: number;
        skippedItems: any[];
    }>;
    fulfillCheckoutSession(sessionId: string, paymentReference: string, paystackReference: string): Promise<{
        alreadyFulfilled: boolean;
        orderIds: string[];
        orders?: undefined;
    } | {
        orders: {
            _id: any;
            orderNumber: string;
            itemCount: number;
            totalAmount: number;
        }[];
        alreadyFulfilled?: undefined;
        orderIds?: undefined;
    }>;
    failCheckoutSession(paymentReference: string): Promise<void>;
    findSessionByReference(paymentReference: string): Promise<import("mongoose").Document<unknown, {}, CheckoutSessionDocument> & CheckoutSession & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    getItemCount(userId: string): Promise<{
        count: number;
    }>;
    clearCartInternal(userId: string): Promise<void>;
    removeCheckedOutItems(userId: string, listingIds: string[]): Promise<void>;
    private formatCart;
}
