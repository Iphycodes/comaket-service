import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private configService;
    private readonly logger;
    private transporter;
    private readonly fromAddress;
    private readonly adminEmail;
    private readonly isConfigured;
    private readonly brand;
    constructor(configService: ConfigService);
    private send;
    sendRawEmail(to: string, subject: string, html: string): Promise<void>;
    sendVerificationOtp(email: string, firstName: string, otp: string): Promise<void>;
    sendWelcome(email: string, firstName: string): Promise<void>;
    sendPasswordReset(email: string, firstName: string, resetToken: string): Promise<void>;
    sendOrderConfirmation(buyerEmail: string, data: {
        buyerName: string;
        orderNumber: string;
        items: Array<{
            itemName: string;
            quantity: number;
            unitPrice: number;
        }>;
        totalAmount: number;
        shippingAddress: {
            fullName: string;
            address: string;
            city: string;
            state: string;
        };
    }): Promise<void>;
    sendAdminOrderCopy(data: {
        buyerName: string;
        orderNumber: string;
        items: Array<{
            itemName: string;
            quantity: number;
            unitPrice: number;
        }>;
        totalAmount: number;
        shippingAddress: {
            fullName: string;
            address: string;
            city: string;
            state: string;
        };
    }): Promise<void>;
    sendNewOrderAlert(sellerEmail: string, data: {
        sellerName: string;
        orderNumber: string;
        itemName: string;
        quantity: number;
        sellerPayout: number;
        buyerName: string;
    }): Promise<void>;
    sendOrderStatusUpdate(buyerEmail: string, data: {
        buyerName: string;
        orderNumber: string;
        status: string;
        trackingNumber?: string;
        carrier?: string;
    }): Promise<void>;
    sendListingApproved(sellerEmail: string, sellerName: string, itemName: string): Promise<void>;
    sendListingRejected(sellerEmail: string, sellerName: string, itemName: string, reason: string): Promise<void>;
}
