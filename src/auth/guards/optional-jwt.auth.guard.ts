/**
 * auth/guards/optional-jwt-auth.guard.ts - Optional Authentication Guard
 * =========================================================================
 * Like JwtAuthGuard, but does NOT reject unauthenticated requests.
 *
 * If a valid Bearer token is present → attaches user to request.
 * If no token or invalid token → continues without user (req.user = null).
 *
 * Usage:
 *   @UseGuards(OptionalJwtAuthGuard)
 *   @Post('reviews')
 *   create(@Req() req) {
 *     const userId = req.user?.sub; // may be undefined
 *   }
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Don't throw on missing/invalid token — just return null
    return user || null;
  }
}