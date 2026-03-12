export declare enum UserRole {
    User = "user",
    Creator = "creator",
    Admin = "admin",
    SuperAdmin = "super_admin"
}
export declare enum AuthProvider {
    Local = "local",
    Google = "google"
}
export declare enum CreatorPlan {
    Starter = "starter",
    Pro = "pro",
    Business = "business"
}
export declare enum CreatorStatus {
    Active = "active",
    Suspended = "suspended",
    Deactivated = "deactivated"
}
export declare enum StoreStatus {
    Active = "active",
    Suspended = "suspended",
    Closed = "closed",
    PendingApproval = "pending_approval"
}
export declare enum ListingType {
    SelfListing = "self_listing",
    Consignment = "consignment",
    DirectPurchase = "direct_purchase"
}
export declare enum ListingStatus {
    Draft = "draft",
    InReview = "in_review",
    Approved = "approved",
    Rejected = "rejected",
    AwaitingFee = "awaiting_fee",
    AwaitingProduct = "awaiting_product",
    PriceOffered = "price_offered",
    CounterOffer = "counter_offer",
    Live = "live",
    Sold = "sold",
    Suspended = "suspended",
    Expired = "expired",
    Delisted = "delisted"
}
export declare const PendingApproval = ListingStatus.InReview;
export declare enum ItemCondition {
    BrandNew = "brand_new",
    FairlyUsed = "fairly_used",
    Refurbished = "refurbished"
}
export declare enum OrderStatus {
    Pending = "pending",
    Confirmed = "confirmed",
    Processing = "processing",
    Shipped = "shipped",
    Delivered = "delivered",
    Completed = "completed",
    Cancelled = "cancelled",
    Refunded = "refunded"
}
export declare enum PaymentStatus {
    Pending = "pending",
    Processing = "processing",
    Success = "success",
    Failed = "failed",
    Refunded = "refunded"
}
export declare enum DisbursementStatus {
    AwaitingCompletion = "awaiting_completion",
    AwaitingDisbursement = "awaiting_disbursement",
    Disbursed = "disbursed",
    NotApplicable = "not_applicable"
}
export declare enum PaymentType {
    ProductPurchase = "product_purchase",
    ListingFee = "listing_fee",
    Subscription = "subscription",
    Payout = "payout"
}
export declare enum Currency {
    NGN = "NGN"
}
export declare enum NotificationType {
    ListingApproved = "listing_approved",
    ListingRejected = "listing_rejected",
    NewOrder = "new_order",
    OrderStatusUpdate = "order_status_update",
    PaymentReceived = "payment_received",
    PayoutSent = "payout_sent",
    NewReview = "new_review",
    SystemAlert = "system_alert"
}
export declare const DEFAULT_COMMISSION_RATES: {
    readonly self_listing: 5;
    readonly consignment: 15;
    readonly direct_purchase: 0;
};
export declare const PLAN_PRICING: {
    readonly starter: 0;
    readonly pro: 300000;
    readonly business: 800000;
};
export declare const PLAN_LIMITS: {
    readonly stores: {
        readonly starter: 1;
        readonly pro: 3;
        readonly business: number;
    };
    readonly featuredWorks: {
        readonly starter: 0;
        readonly pro: 10;
        readonly business: 25;
    };
};
