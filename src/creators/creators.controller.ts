/**
 * creators/creators.controller.ts - Creator Endpoints
 * ======================================================
 * This controller has TWO types of endpoints:
 *
 * 1. PROTECTED (require JWT): For the creator managing their own profile
 *    - POST /creators/become       → Upgrade user to creator
 *    - GET  /creators/me            → Get own creator profile
 *    - PATCH /creators/me           → Update own profile
 *    - PATCH /creators/me/bank      → Update bank details
 *
 * 2. PUBLIC (no JWT): For browsing creators on the marketplace
 *    - GET /creators                → List/search all creators
 *    - GET /creators/:slug          → View a creator's public profile
 *
 * Notice we use both @UseGuards(JwtAuthGuard) on specific methods
 * instead of the whole class — because some routes are public.
 *
 * The 'me' pattern (GET /creators/me) is a REST convention meaning
 * "the currently authenticated user's resource". It avoids exposing
 * internal IDs in URLs for personal operations.
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatorsService } from './creators.service';
import {
  BecomeCreatorDto,
  UpdateCreatorDto,
  BankDetailsDto,
  QueryCreatorsDto,
} from './dto/creator.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';

@ApiTags('creators')
@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  // ═══════════════════════════════════════════════════════════
  // PROTECTED ENDPOINTS (require authentication)
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/creators/become ───────────────────────

  @Post('become')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Creator profile created successfully')
  @ApiOperation({
    summary: 'Become a creator',
    description:
      'Upgrades a regular user to a creator. Creates a creator profile ' +
      'and updates the user role. Starts on the free Starter plan.',
  })
  @ApiResponse({ status: 201, description: 'Creator profile created' })
  @ApiResponse({ status: 409, description: 'User is already a creator' })
  async becomeCreator(
    @GetUser() user: JwtPayload,
    @Body() becomeCreatorDto: BecomeCreatorDto,
  ) {
    return this.creatorsService.becomeCreator(user.sub, becomeCreatorDto);
  }

  // ─── GET /api/v1/creators/me ────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my creator profile',
    description: "Returns the authenticated user's creator profile",
  })
  @ApiResponse({ status: 200, description: 'Creator profile retrieved' })
  @ApiResponse({ status: 404, description: 'User is not a creator' })
  async getMyProfile(@GetUser() user: JwtPayload) {
    return this.creatorsService.findByUserId(user.sub);
  }

  // ─── PATCH /api/v1/creators/me ──────────────────────────

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Creator profile updated successfully')
  @ApiOperation({
    summary: 'Update my creator profile',
    description: "Updates the authenticated user's creator profile",
  })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(
    @GetUser() user: JwtPayload,
    @Body() updateCreatorDto: UpdateCreatorDto,
  ) {
    return this.creatorsService.updateProfile(user.sub, updateCreatorDto);
  }

  // ─── PATCH /api/v1/creators/me/bank ─────────────────────

  @Patch('me/bank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Bank details updated successfully')
  @ApiOperation({
    summary: 'Update my bank details',
    description: 'Updates bank account info for receiving payouts',
  })
  @ApiResponse({ status: 200, description: 'Bank details updated' })
  async updateBankDetails(
    @GetUser() user: JwtPayload,
    @Body() bankDetailsDto: BankDetailsDto,
  ) {
    return this.creatorsService.updateBankDetails(user.sub, bankDetailsDto);
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS (no authentication required)
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/creators ───────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Browse creators',
    description:
      'List and search creators on the marketplace. ' +
      'Supports filtering by status, plan, category, and text search.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of creators' })
  async findAll(@Query() queryDto: QueryCreatorsDto) {
    return this.creatorsService.findAll(queryDto);
  }

  // ─── POST /api/v1/creators/check-username ──────────────

  @Post('check-username')
  @ResponseMessage('Username availability checked')
  @ApiOperation({
    summary: 'Check username availability',
    description:
      'Returns whether a username is available for a new creator profile.',
  })
  @ApiResponse({ status: 200, description: '{ available: true | false }' })
  async checkUsername(@Body('username') username: string) {
    return this.creatorsService.checkUsername(username);
  }

  // ─── GET /api/v1/creators/:slug ─────────────────────────
  // IMPORTANT: This route must come AFTER /me and /become
  // because NestJS matches routes top-to-bottom. If :slug came
  // first, a request to /creators/me would match :slug="me".

  @Get(':slug')
  @ApiOperation({
    summary: 'View creator profile by slug',
    description:
      "Returns a creator's public profile. Use the slug from the URL " +
      '(e.g., "johns-craft-studio")',
  })
  @ApiResponse({ status: 200, description: 'Creator profile' })
  @ApiResponse({ status: 404, description: 'Creator not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.creatorsService.findBySlug(slug);
  }
}