/**
 * featured-works/featured-works.controller.ts
 * ==============================================
 * Full CRUD for creator and store portfolio/showcase items.
 *
 * AUTHENTICATED (creator only):
 *   POST   /featured-works              → Add a new featured work
 *   PATCH  /featured-works/:id          → Update title/description/image
 *   DELETE /featured-works/:id          → Delete a single work
 *   DELETE /featured-works/owner/:ownerType/:ownerId → Delete all works for an owner
 *   PATCH  /featured-works/reorder      → Reorder works (drag-and-drop)
 *
 * PUBLIC (no auth):
 *   GET    /featured-works              → Get works by owner (query: ownerType, ownerId)
 *   GET    /featured-works/count        → Get count + plan limit for an owner
 *   GET    /featured-works/:id          → Get single work by ID
 */

import {
  Body,
  Controller,
  Delete,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeaturedWorksService } from './featured-works.service';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';
import {
  CreateFeaturedWorkDto,
  UpdateFeaturedWorkDto,
  ReorderFeaturedWorksDto,
  QueryFeaturedWorksDto,
} from './dto/featured-works.dto';
import { FeaturedWorkOwnerType } from './schema/featured-works.schema';

@ApiTags('featured-works')
@Controller('featured-works')
export class FeaturedWorksController {
  constructor(private readonly featuredWorksService: FeaturedWorksService) {}

  // ═══════════════════════════════════════════════════════════
  // AUTHENTICATED ENDPOINTS (creator only)
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/featured-works ────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Featured work added')
  @ApiOperation({
    summary: 'Add a featured work',
    description:
      'Adds a new portfolio/showcase item to a creator or store profile. ' +
      'Enforces plan limits: Starter = 0, Pro = 10, Business = 25.',
  })
  @ApiResponse({ status: 201, description: 'Featured work created' })
  @ApiResponse({
    status: 400,
    description: 'Plan limit reached or not available',
  })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Creator/Store not found' })
  async create(
    @GetUser() user: JwtPayload,
    @Body() dto: CreateFeaturedWorkDto,
  ) {
    return this.featuredWorksService.create(user.sub, dto);
  }

  // ─── PATCH /api/v1/featured-works/reorder ───────────────
  // NOTE: This must come BEFORE :id routes

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Featured works reordered')
  @ApiOperation({
    summary: 'Reorder featured works',
    description:
      'Send an array of featured work IDs in the desired display order. ' +
      'Positions will be updated to match the array order.',
  })
  @ApiResponse({ status: 200, description: 'Reordered list returned' })
  async reorder(
    @GetUser() user: JwtPayload,
    @Body() dto: ReorderFeaturedWorksDto,
  ) {
    return this.featuredWorksService.reorder(user.sub, dto);
  }

  // ─── PATCH /api/v1/featured-works/:id ───────────────────

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Featured work updated')
  @ApiOperation({
    summary: 'Update a featured work',
    description:
      'Update the title, description, or image URL of a featured work.',
  })
  @ApiParam({ name: 'id', description: 'Featured work ID' })
  @ApiResponse({ status: 200, description: 'Updated work returned' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Work not found' })
  async update(
    @GetUser() user: JwtPayload,
    @Param('id') workId: string,
    @Body() dto: UpdateFeaturedWorkDto,
  ) {
    return this.featuredWorksService.update(user.sub, workId, dto);
  }

  // ─── DELETE /api/v1/featured-works/owner/:ownerType/:ownerId ─
  // NOTE: Must come BEFORE the :id DELETE route

  @Delete('owner/:ownerType/:ownerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('All featured works deleted')
  @ApiOperation({
    summary: 'Delete all featured works for an owner',
    description: 'Removes all featured works from a creator or store profile.',
  })
  @ApiParam({ name: 'ownerType', enum: FeaturedWorkOwnerType })
  @ApiParam({ name: 'ownerId', description: 'Creator or Store ID' })
  @ApiResponse({ status: 200, description: '{ deletedCount }' })
  async removeAll(
    @GetUser() user: JwtPayload,
    @Param('ownerType') ownerType: FeaturedWorkOwnerType,
    @Param('ownerId') ownerId: string,
  ) {
    return this.featuredWorksService.removeAll(user.sub, ownerType, ownerId);
  }

  // ─── DELETE /api/v1/featured-works/:id ──────────────────

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Featured work deleted')
  @ApiOperation({
    summary: 'Delete a featured work',
    description:
      'Removes a single featured work and shifts remaining positions.',
  })
  @ApiParam({ name: 'id', description: 'Featured work ID' })
  @ApiResponse({ status: 200, description: '{ deleted: true }' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Work not found' })
  async remove(@GetUser() user: JwtPayload, @Param('id') workId: string) {
    return this.featuredWorksService.remove(user.sub, workId);
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/featured-works/count ───────────────────

  @Get('count')
  @ApiOperation({
    summary: 'Get featured works count and limit',
    description:
      'Returns current count, plan limit, and plan name for a creator or store. ' +
      'Useful for showing "3/10 featured works" in the UI.',
  })
  @ApiResponse({ status: 200, description: '{ count, limit, plan }' })
  async count(
    @Query('ownerType') ownerType: FeaturedWorkOwnerType,
    @Query('ownerId') ownerId: string,
  ) {
    return this.featuredWorksService.countByOwner(ownerType, ownerId);
  }

  // ─── GET /api/v1/featured-works ─────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get featured works by owner',
    description:
      'Returns paginated featured works for a creator or store, sorted by position. ' +
      'Pass ownerType and ownerId as query params.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of featured works' })
  async findByOwner(@Query() queryDto: QueryFeaturedWorksDto) {
    return this.featuredWorksService.findByOwner(queryDto);
  }

  // ─── GET /api/v1/featured-works/:id ─────────────────────

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single featured work',
    description: 'Returns a featured work by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Featured work ID' })
  @ApiResponse({ status: 200, description: 'Featured work object' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id') workId: string) {
    return this.featuredWorksService.findById(workId);
  }
}
