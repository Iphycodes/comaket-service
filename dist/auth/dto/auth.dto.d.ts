export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class GoogleAuthDto {
    token: string;
}
export declare class VerifyEmailDto {
    email: string;
    otp: string;
}
export declare class ResendVerificationDto {
    email: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
