import { Document } from 'mongoose';
import { AuthProvider, UserRole } from '@config/contants';
import { BaseSchema } from '@common/schemas/base-schema';
export type UserDocument = User & Document;
declare class Mobile {
    phoneNumber: string;
    isoCode: string;
}
export declare class User extends BaseSchema {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    avatar?: string;
    mobile?: Mobile;
    role: UserRole;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    isSuspended: boolean;
    gender?: string;
    dateOfBirth?: string;
    country?: string;
    state?: string;
    city?: string;
    bio?: string;
    verificationCode?: string;
    verificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
export {};
