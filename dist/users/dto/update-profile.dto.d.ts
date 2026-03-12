import { CreateUserDto } from './create-user.dto';
declare const UpdateProfileDto_base: import("@nestjs/common").Type<Partial<Omit<CreateUserDto, "email" | "password" | "authProvider" | "isEmailVerified" | "verificationCode" | "verificationExpires" | "passwordResetToken" | "passwordResetExpires">>>;
export declare class UpdateProfileDto extends UpdateProfileDto_base {
}
export {};
