/**
 * users/users.service.ts - User Business Logic
 * ===============================================
 * A Service in NestJS contains your BUSINESS LOGIC — the actual work.
 * Controllers handle HTTP concerns (routes, status codes, decorators),
 * Services handle everything else (database queries, validation logic,
 * transformations).
 *
 * Why separate them?
 * - Services can be reused across modules (AuthService uses UsersService)
 * - Easier to test (mock the service, test the logic)
 * - Clean separation: Controller = "what endpoint?" / Service = "what work?"
 *
 * @Injectable() tells NestJS this class can be "injected" into other classes.
 * This is Dependency Injection (DI) — instead of doing:
 *   const service = new UsersService(new Model(...))  ← manual, messy
 * NestJS does:
 *   constructor(private usersService: UsersService)   ← automatic, clean
 *
 * @InjectModel(User.name) gives you the Mongoose Model for the User collection.
 * Think of the Model as your gateway to the database for that collection.
 */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { AuthProvider } from '@config/contants';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Create a new user.
   * - Checks for duplicate email
   * - Hashes password (if not a Google user)
   * - Returns user WITHOUT password
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, password, authProvider } = createUserDto;

    // Check if email is already taken
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password for local (email+password) users
    // Google users don't have a password — they authenticate via Google's token
    const hashedPassword =
      authProvider !== AuthProvider.Google && password
        ? await bcrypt.hash(password, 10) // 10 = salt rounds (industry standard)
        : undefined;

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  /**
   * Find a user by their MongoDB _id.
   * Throws NotFoundException if not found — this is better than returning null
   * because the calling code doesn't need to check for null every time.
   */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Find by email — used during login and registration checks.
   * Returns null instead of throwing, because "user not found by email"
   * is a normal case during login (wrong credentials), not an error.
   *
   * The .select('+password +verificationCode +verificationExpires') explicitly
   * includes fields that are excluded by default (select: false in schema).
   * We need these for auth operations like login and email verification.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password +verificationCode +verificationExpires')
      .exec();
  }

  /**
   * Get user profile — strips sensitive fields via the schema's toJSON transform.
   */
  async getProfile(userId: string): Promise<UserDocument> {
    return this.findById(userId);
  }

  /**
   * Update user profile.
   * - findByIdAndUpdate with { new: true } returns the UPDATED document
   * - runValidators: true ensures Mongoose validates the update against the schema
   */
  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Internal update — used by auth service for things like setting
   * verification codes, reset tokens, etc. Accepts any partial user fields.
   */
  async updateInternal(
    userId: string,
    update: Partial<User>,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find a user by their password reset token.
   * Tokens are hashed in the database (same approach as your Redymit app),
   * so we find users with non-expired tokens and compare each one.
   */
  async findByResetToken(token: string): Promise<UserDocument | null> {
    const users = await this.userModel
      .find({
        passwordResetToken: { $ne: null },
        passwordResetExpires: { $gt: new Date() },
      })
      .select('+passwordResetToken +passwordResetExpires')
      .exec();

    for (const user of users) {
      const isMatch = await bcrypt.compare(token, user.passwordResetToken);
      if (isMatch) return user;
    }

    return null;
  }

  /**
   * Count total users — used by admin dashboard.
   */
  async countUsers(filter: Record<string, any> = {}): Promise<number> {
    return this.userModel.countDocuments(filter).exec();
  }
}