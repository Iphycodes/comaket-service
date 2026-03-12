declare const _default: (() => {
    name: string;
    logoUrl: string;
    env: string;
    port: number;
    corsOrigin: string;
    frontendUrl: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    paystack: {
        secretKey: string;
        publicKey: string;
        baseUrl: string;
        callbackUrl: string;
        webhookSecret: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    mail: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    adminEmail: string;
    listing: {
        freeListing: boolean;
        noCommission: boolean;
        selfListingFeePercent: number;
        consignmentCommissionPercent: number;
        listingFeeCapKobo: number;
        consignmentCommissionCapKobo: number;
    };
    upload: {
        maxFileSize: number;
        maxFiles: number;
        allowedMimeTypes: string[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    name: string;
    logoUrl: string;
    env: string;
    port: number;
    corsOrigin: string;
    frontendUrl: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    paystack: {
        secretKey: string;
        publicKey: string;
        baseUrl: string;
        callbackUrl: string;
        webhookSecret: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    mail: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    adminEmail: string;
    listing: {
        freeListing: boolean;
        noCommission: boolean;
        selfListingFeePercent: number;
        consignmentCommissionPercent: number;
        listingFeeCapKobo: number;
        consignmentCommissionCapKobo: number;
    };
    upload: {
        maxFileSize: number;
        maxFiles: number;
        allowedMimeTypes: string[];
    };
}>;
export default _default;
