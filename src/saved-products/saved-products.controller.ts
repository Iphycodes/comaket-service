/**
 * saved-products/saved-products.controller.ts - Wishlist Routes
 * ===============================================================
 * All routes require authentication.
 *
 * POST   /saved-products/toggle        Toggle save/unsave a listing
 * POST   /saved-products/check         Check saved status for multiple listings
 * GET    /saved-products               Get my saved products (paginated)
 * GET    /saved-products/count          Get saved items count
 * DELETE /saved-products/:listingId     Remove a saved listing
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { SavedProductsService } from './saved-products.service';
import { SaveProductDto, QuerySavedProductsDto } from './dto/saved-product.dto';

@ApiTags('Saved Products (Wishlist)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('saved-products')
export class SavedProductsController {
  constructor(private readonly savedProductsService: SavedProductsService) {}

  // ─── Toggle Save/Unsave ──────────────────────────────────────────

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle save/unsave a listing' })
  @ResponseMessage('Success')
  async toggle(@Req() req: any, @Body() dto: SaveProductDto) {
    return this.savedProductsService.toggle(req.user.sub, dto.listingId);
  }

  // ─── Check Saved Status (batch) ──────────────────────────────────

  @Post('check')
  @ApiOperation({
    summary: 'Check if listings are saved',
    description:
      'Pass an array of listing IDs, returns a map of { listingId: boolean }',
  })
  @ResponseMessage('Success')
  async checkSavedStatus(
    @Req() req: any,
    @Body('listingIds') listingIds: string[],
  ) {
    return this.savedProductsService.checkSavedStatus(req.user.sub, listingIds);
  }

  // ─── Get My Saved Products ──────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get my saved products (paginated)' })
  @ResponseMessage('Success')
  async getSavedProducts(
    @Req() req: any,
    @Query() query: QuerySavedProductsDto,
  ) {
    return this.savedProductsService.getSavedProducts(
      req.user.sub,
      query.page,
      query.perPage,
    );
  }

  // ─── Get Saved Count ─────────────────────────────────────────────

  @Get('count')
  @ApiOperation({ summary: 'Get saved items count' })
  @ResponseMessage('Success')
  async getSavedCount(@Req() req: any) {
    return this.savedProductsService.getSavedCount(req.user.sub);
  }

  // ─── Remove Saved Product ────────────────────────────────────────

  @Delete(':listingId')
  @ApiOperation({ summary: 'Remove a listing from saved items' })
  @ResponseMessage('Listing removed from saved items')
  async remove(@Req() req: any, @Param('listingId') listingId: string) {
    return this.savedProductsService.remove(req.user.sub, listingId);
  }
}