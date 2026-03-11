/**
 * follows/follows.controller.ts - Follow Endpoints
 * ===================================================
 * POST   /follows/toggle           → Follow or unfollow a creator/store
 * POST   /follows/check            → Check follow status for multiple targets
 * GET    /follows                   → Get my follows (with optional type filter)
 * GET    /follows/count             → Get my total follow count
 * GET    /follows/:targetType/:targetId/followers → Get followers of a creator/store
 */

import {
  Body,
  Controller,
  Get,
  Param,
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
import { FollowsService } from './follows.service';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';
import { CheckFollowDto, QueryFollowsDto, ToggleFollowDto } from './dto/follows.dto';
import { FollowTargetType } from './schema/follows.shema';


@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  // ─── POST /api/v1/follows/toggle ────────────────────────

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Follow toggled')
  @ApiOperation({
    summary: 'Follow or unfollow a creator/store',
    description:
      'Toggles follow state. Returns { followed: true/false, totalFollowers }.',
  })
  @ApiResponse({ status: 200, description: 'Follow state toggled' })
  @ApiResponse({ status: 404, description: 'Target not found' })
  async toggle(
    @GetUser() user: JwtPayload,
    @Body() toggleDto: ToggleFollowDto,
  ) {
    return this.followsService.toggle(user.sub, toggleDto);
  }

  // ─── POST /api/v1/follows/check ─────────────────────────

  @Post('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check follow status',
    description:
      'Check if the current user follows one or more creators/stores. ' +
      'Returns a map of targetId → boolean.',
  })
  @ApiResponse({ status: 200, description: 'Map of follow statuses' })
  async check(@GetUser() user: JwtPayload, @Body() checkDto: CheckFollowDto) {
    return this.followsService.check(user.sub, checkDto);
  }

  // ─── GET /api/v1/follows ────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my follows',
    description:
      'Returns all creators/stores the current user follows. ' +
      'Optionally filter by targetType (creator or store).',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of follows' })
  async findMyFollows(
    @GetUser() user: JwtPayload,
    @Query() queryDto: QueryFollowsDto,
  ) {
    return this.followsService.findMyFollows(user.sub, queryDto);
  }

  // ─── GET /api/v1/follows/count ──────────────────────────

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my follow count',
    description: 'Returns total number of creators/stores the user follows.',
  })
  @ApiResponse({ status: 200, description: 'Follow count' })
  async getCount(
    @GetUser() user: JwtPayload,
    @Query('targetType') targetType?: FollowTargetType,
  ) {
    const count = await this.followsService.getFollowCount(
      user.sub,
      targetType,
    );
    return { count };
  }

  // ─── GET /api/v1/follows/:targetType/:targetId/followers ─

  @Get(':targetType/:targetId/followers')
  @ApiOperation({
    summary: 'Get followers of a creator or store',
    description: 'Public endpoint. Returns paginated list of followers.',
  })
  @ApiParam({ name: 'targetType', enum: FollowTargetType })
  @ApiParam({ name: 'targetId', description: 'Creator or Store MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Paginated list of followers' })
  async findFollowers(
    @Param('targetType') targetType: FollowTargetType,
    @Param('targetId') targetId: string,
    @Query() queryDto: QueryFollowsDto,
  ) {
    return this.followsService.findFollowers(targetType, targetId, queryDto);
  }
}