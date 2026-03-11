/**
 * stores/stores.controller.ts - Store Endpoints
 * ================================================
 * Like the CreatorsController, this has both protected and public endpoints.
 *
 * PROTECTED (creator must be logged in):
 *   POST   /stores              → Create a new store
 *   GET    /stores/mine         → List my stores
 *   PATCH  /stores/:id          → Update my store
 *   DELETE /stores/:id          → Close my store
 *
 * PUBLIC (no auth):
 *   GET    /stores              → Browse all stores
 *   GET    /stores/by-creator/:creatorId → All stores by a creator
 *   GET    /stores/:slug        → View store by slug
 *
 * ROUTE ORDER MATTERS:
 * Static routes (/mine, /by-creator/:id) must come BEFORE
 * the dynamic :slug route. Otherwise NestJS would try to
 * look up slug="mine" in the database.
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
import { StoresService } from './stores.service';
import {
  CreateStoreDto,
  UpdateStoreDto,
  QueryStoresDto,
} from './dto/store.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // ═══════════════════════════════════════════════════════════
  // PROTECTED ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/v1/stores ────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Store created successfully')
  @ApiOperation({
    summary: 'Create a new store',
    description:
      "Creates a store under the authenticated creator's profile. " +
      'Enforces plan-based limits: Starter = 1 store, Pro = 3, Business = unlimited.',
  })
  @ApiResponse({ status: 201, description: 'Store created' })
  @ApiResponse({
    status: 400,
    description: 'Store limit reached for current plan',
  })
  @ApiResponse({ status: 404, description: 'User is not a creator' })
  async create(
    @GetUser() user: JwtPayload,
    @Body() createStoreDto: CreateStoreDto,
  ) {
    return this.storesService.create(user.sub, createStoreDto);
  }

  // ─── GET /api/v1/stores/mine ────────────────────────────

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List my stores',
    description: 'Returns all stores belonging to the authenticated creator',
  })
  @ApiResponse({ status: 200, description: "List of creator's stores" })
  async findMyStores(@GetUser() user: JwtPayload) {
    return this.storesService.findMyStores(user.sub);
  }

  // ─── PATCH /api/v1/stores/:id ───────────────────────────

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Store updated successfully')
  @ApiOperation({
    summary: 'Update my store',
    description: 'Updates a store. Only the store owner can do this.',
  })
  @ApiParam({ name: 'id', description: 'Store MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Store updated' })
  @ApiResponse({ status: 403, description: 'Not the store owner' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async update(
    @Param('id') storeId: string,
    @GetUser() user: JwtPayload,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(storeId, user.sub, updateStoreDto);
  }

  // ─── PATCH /api/v1/stores/:id/visibility ────────────────

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Store visibility updated')
  @ApiOperation({
    summary: 'Toggle store visibility',
    description:
      'Hide or show your store on the marketplace. ' +
      "Hidden stores and their listings won't appear in search or browse.",
  })
  @ApiParam({ name: 'id', description: 'Store MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Visibility toggled' })
  @ApiResponse({ status: 403, description: 'Not the store owner' })
  async toggleVisibility(
    @Param('id') storeId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.storesService.toggleVisibility(storeId, user.sub);
  }

  // ─── DELETE /api/v1/stores/:id ──────────────────────────

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Store closed successfully')
  @ApiOperation({
    summary: 'Close my store',
    description:
      'Closes a store (soft close). The store and its data remain in the ' +
      'database but become inactive. Only the store owner can do this.',
  })
  @ApiParam({ name: 'id', description: 'Store MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Store closed' })
  @ApiResponse({ status: 403, description: 'Not the store owner' })
  async closeStore(@Param('id') storeId: string, @GetUser() user: JwtPayload) {
    return this.storesService.closeStore(storeId, user.sub);
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── GET /api/v1/stores ─────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Browse stores',
    description:
      'List and search stores on the marketplace. ' +
      'Supports filtering by category, creator, and text search.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of stores' })
  async findAll(@Query() queryDto: QueryStoresDto) {
    return this.storesService.findAll(queryDto);
  }

  // ─── GET /api/v1/stores/by-creator/:creatorId ───────────

  @Get('by-creator/:creatorId')
  @ApiOperation({
    summary: 'Get stores by creator',
    description:
      'Returns all active stores belonging to a specific creator. ' +
      "Used on the creator's public profile page.",
  })
  @ApiParam({ name: 'creatorId', description: 'Creator MongoDB ID' })
  @ApiResponse({ status: 200, description: "List of creator's stores" })
  async findByCreator(@Param('creatorId') creatorId: string) {
    return this.storesService.findByCreatorId(creatorId);
  }

  // ─── GET /api/v1/stores/id/:id ────────────────────────

  @Get('id/:id')
  @ApiOperation({
    summary: 'View store by ID',
    description: "Returns a store's public profile by its MongoDB ID.",
  })
  @ApiParam({ name: 'id', description: 'Store MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Store details' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findById(@Param('id') storeId: string) {
    return this.storesService.findById(storeId);
  }

  // ─── GET /api/v1/stores/:slug ───────────────────────────
  // MUST come last — dynamic :slug would match "mine", "by-creator", etc.

  @Get(':slug')
  @ApiOperation({
    summary: 'View store by slug',
    description:
      "Returns a store's public profile by its URL slug. " +
      'e.g., /stores/johns-clothing',
  })
  @ApiParam({ name: 'slug', example: 'johns-clothing' })
  @ApiResponse({ status: 200, description: 'Store details' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }
}