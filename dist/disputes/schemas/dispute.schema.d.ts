import { Document, Types } from 'mongoose';
import { BaseSchema } from '@common/schemas/base-schema';
export type DisputeDocument = Dispute & Document;
export declare enum DisputeType {
    OrderIssue = "order_issue",
    PaymentIssue = "payment_issue",
    ProductQuality = "product_quality",
    DeliveryIssue = "delivery_issue",
    SellerDispute = "seller_dispute",
    Other = "other"
}
export declare enum DisputeStatus {
    Open = "open",
    UnderReview = "under_review",
    Resolved = "resolved",
    Closed = "closed"
}
export declare enum DisputePriority {
    Low = "low",
    Medium = "medium",
    High = "high"
}
declare class DisputeMessage {
    sender: Types.ObjectId;
    message: string;
    createdAt: Date;
}
export declare class Dispute extends BaseSchema {
    userId: Types.ObjectId;
    orderId: Types.ObjectId | null;
    type: DisputeType;
    subject: string;
    description: string;
    status: DisputeStatus;
    priority: DisputePriority;
    resolution: string | null;
    attachments: string[];
    messages: DisputeMessage[];
    assignedTo: Types.ObjectId | null;
    resolvedAt: Date | null;
}
export declare const DisputeSchema: import("mongoose").Schema<Dispute, import("mongoose").Model<Dispute, any, any, any, Document<unknown, any, Dispute> & Dispute & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Dispute, Document<unknown, {}, import("mongoose").FlatRecord<Dispute>> & import("mongoose").FlatRecord<Dispute> & {
    _id: Types.ObjectId;
}>;
export {};
