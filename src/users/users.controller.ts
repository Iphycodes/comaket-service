/**
 * users/users.controller.ts - User Profile Endpoints
 * =====================================================
 * This controller handles user profile operations. ALL routes here
 * require authentication (JwtAuthGuard at the class level).
 *
 * NestJS routing works like this:
 *   @Controller('users')           → base path is /api/v1/users
 *   @Get('profile')                → GET /api/v1/users/profile
 *   @Patch('profile')              → PATCH /api/v1/users/profile
 *
 * @UseGuards(JwtAuthGuard) at the CLASS level means EVERY endpoint
 * in this controller requires a valid JWT token. No exceptions.
 *
 * @ApiBearerAuth('JWT-auth') tells Swagger to show the lock icon
 * and include the Authorization header in test requests.
 */

import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── GET /api/v1/users/profile ──────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@GetUser() user: JwtPayload) {
    // user.sub is the MongoDB _id, extracted from the JWT token
    // by the JwtStrategy (we'll create that next)
    return this.usersService.getProfile(user.sub);
  }

  // ─── PATCH /api/v1/users/profile ────────────────────────

  @Patch('me')
  @ResponseMessage('Profile updated successfully')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @GetUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, updateProfileDto);
  }
}
