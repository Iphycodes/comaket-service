/**
 * reviews/reviews.controller.ts - Review Endpoints
 * ===================================================
 * POST   /reviews              → Leave a review (auth optional — anonymous allowed)
 * PATCH  /reviews/:id/reply    → Reply to a review (auth required — seller/creator only)
 * GET    /reviews              → Browse reviews (filter by listing/store/creator/order)
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  SellerReplyDto,
  QueryReviewsDto,
} from './dto/review.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt.auth.guard';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── POST /api/v1/reviews ──────────────────────────────

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Review submitted successfully')
  @ApiOperation({
    summary: 'Leave a review',
    description:
      'Submit a review for a creator, store, listing, or order. ' +
      'At least one target (creatorId, storeId, listingId, orderId) is required. ' +
      'Auth is optional — anonymous reviews are supported.',
  })
  @ApiResponse({ status: 201, description: 'Review created' })
  @ApiResponse({ status: 400, description: 'No target provided' })
  async create(@Req() req: any, @Body() createDto: CreateReviewDto) {
    const reviewerId = req.user?.sub || null;
    return this.reviewsService.create(reviewerId, createDto);
  }

  // ─── PATCH /api/v1/reviews/:id/reply ───────────────────

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Reply added successfully')
  @ApiOperation({
    summary: 'Reply to a review (seller/creator)',
    description:
      'Sellers and creators can reply to reviews on their store or profile.',
  })
  @ApiParam({ name: 'id', description: 'Review MongoDB ID' })
  async sellerReply(
    @Param('id') reviewId: string,
    @GetUser() user: JwtPayload,
    @Body() replyDto: SellerReplyDto,
  ) {
    return this.reviewsService.sellerReply(reviewId, user.sub, replyDto);
  }

  // ─── GET /api/v1/reviews ───────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Browse reviews',
    description:
      'Get reviews filtered by listing, store, creator, or order. ' +
      'Used on listing detail pages, store pages, and creator profiles.',
  })
  @ApiResponse({ status: 200, description: 'Paginated reviews' })
  async findAll(@Query() queryDto: QueryReviewsDto) {
    return this.reviewsService.findAll(queryDto);
  }
}