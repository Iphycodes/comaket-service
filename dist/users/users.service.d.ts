import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: CreateUserDto): Promise<UserDocument>;
    findById(id: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    getProfile(userId: string): Promise<UserDocument>;
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserDocument>;
    updateInternal(userId: string, update: Partial<User>): Promise<UserDocument>;
    findByResetToken(token: string): Promise<UserDocument | null>;
    countUsers(filter?: Record<string, any>): Promise<number>;
}
