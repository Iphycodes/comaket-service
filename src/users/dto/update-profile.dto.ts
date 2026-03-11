/**
 * users/dto/update-profile.dto.ts - Update Profile Data Shape
 * ==============================================================
 * PartialType() is a NestJS utility that takes a DTO and makes ALL fields
 * optional. So instead of rewriting every field with @IsOptional(), we
 * just extend PartialType(CreateUserDto).
 *
 * OmitType() removes fields that users should NOT be able to update
 * themselves (like email, password, role). Those are handled through
 * dedicated endpoints (change email, change password, etc.)
 *
 * The result: UpdateProfileDto has all CreateUserDto fields EXCEPT
 * the omitted ones, and they're all optional.
 */

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateProfileDto extends PartialType(
  OmitType(CreateUserDto, [
    'email', // Can't change email via profile update
    'password', // Use dedicated change-password endpoint
    'authProvider', // Set once during registration
    'isEmailVerified', // Managed by verification flow
    'verificationCode',
    'verificationExpires',
    'passwordResetToken',
    'passwordResetExpires',
  ] as const),
) {}